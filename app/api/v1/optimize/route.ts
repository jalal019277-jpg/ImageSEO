import { NextResponse } from 'next/server';

import { FetchImageError, decodeBase64Image, fetchRemoteImage } from '@/lib/fetchImage';
import { ProcessingError, optimizeImage } from '@/lib/imageProcessing';
import { OUTPUT_FORMATS, type OptimizeOptions, type OutputFormat, type SeoMetadata } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Machine-facing endpoint, built so a single n8n HTTP Request node can post
 * JSON and receive the finished image as binary.
 *
 *   POST /api/v1/optimize
 *   x-api-key: <IMAGE_SEO_API_KEY>
 *
 * Set `response: "json"` in the body to get metadata and a data: URL instead.
 */

type Json = Record<string, unknown>;

const MIME_BY_FORMAT: Record<OutputFormat, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function keywords(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  return text(value)
    .split(/[,\n;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function fail(error: string, status: number, hint?: string) {
  return NextResponse.json({ error, hint }, { status });
}

export async function POST(request: Request) {
  const configuredKey = process.env.IMAGE_SEO_API_KEY;

  // Refuse rather than run unauthenticated: this route is reachable publicly.
  if (!configuredKey) {
    return fail('This API is not enabled.', 503, 'Set IMAGE_SEO_API_KEY in the environment to turn it on.');
  }

  const presented =
    request.headers.get('x-api-key') ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';

  if (presented !== configuredKey) {
    return fail('Invalid or missing API key.', 401, 'Send it as the x-api-key header.');
  }

  let body: Json;
  try {
    body = (await request.json()) as Json;
  } catch {
    return fail('The request body must be valid JSON.', 400);
  }

  // --- source image ---------------------------------------------------------
  let input: Buffer;
  try {
    const imageUrl = text(body.image_url);
    const imageBase64 = text(body.image_base64);

    if (imageUrl) input = await fetchRemoteImage(imageUrl);
    else if (imageBase64) input = decodeBase64Image(imageBase64);
    else return fail('Provide either image_url or image_base64.', 400);
  } catch (error) {
    if (error instanceof FetchImageError) return fail(error.message, error.status);
    return fail('The source image could not be read.', 400);
  }

  // --- options --------------------------------------------------------------
  const requested = text(body.output_format).toLowerCase();
  const normalized = requested === 'jpeg' ? 'jpg' : requested;
  const outputFormat: OutputFormat = OUTPUT_FORMATS.includes(normalized as OutputFormat)
    ? (normalized as OutputFormat)
    : 'webp';

  const quality = Number(body.quality);
  const maxWidth = Number(body.max_width);

  const options: OptimizeOptions = {
    output_format: outputFormat,
    quality: Number.isFinite(quality) && quality > 0 ? quality : 82,
    max_width: Number.isFinite(maxWidth) && maxWidth >= 16 ? Math.round(maxWidth) : null,
  };

  // --- metadata -------------------------------------------------------------
  // Accept the fields nested under `metadata` or flat at the top level.
  const meta = (typeof body.metadata === 'object' && body.metadata !== null ? body.metadata : body) as Json;

  const title = text(meta.title);
  const primaryKeyword = text(meta.primary_keyword);
  const requestedName = text(meta.filename);

  const baseName =
    slugify(requestedName.replace(/\.(png|jpe?g|webp)$/i, '')) ||
    slugify(primaryKeyword) ||
    slugify(title) ||
    'optimized-image';

  const seo: SeoMetadata = {
    filename: `${baseName}.${outputFormat}`,
    title,
    alt_text: text(meta.alt_text),
    subject: text(meta.subject),
    description: text(meta.description),
    primary_keyword: primaryKeyword,
    secondary_keywords: keywords(meta.secondary_keywords),
    author: text(meta.author),
    copyright: text(meta.copyright),
  };

  // --- run ------------------------------------------------------------------
  try {
    const result = await optimizeImage(input, options, seo);

    if (text(body.response).toLowerCase() === 'json') {
      return NextResponse.json(result, { status: 200 });
    }

    // Default: raw bytes, so one HTTP Request node yields the finished file.
    const base64 = result.optimized.data_url.split(',')[1] ?? '';
    const bytes = Buffer.from(base64, 'base64');

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'Content-Type': MIME_BY_FORMAT[outputFormat],
        'Content-Length': String(bytes.length),
        'Content-Disposition': `attachment; filename="${result.seo.filename}"`,
        'Cache-Control': 'no-store',
        // Everything the caller would otherwise need a second request for.
        'X-Image-Filename': result.seo.filename,
        'X-Image-Format': outputFormat,
        'X-Image-Width': String(result.optimized.width ?? ''),
        'X-Image-Height': String(result.optimized.height ?? ''),
        'X-Image-Size-Bytes': String(result.optimized.size_bytes),
        'X-Image-Original-Size-Bytes': String(result.original.size_bytes),
        'X-Image-Reduction-Percent': String(result.size_reduction_percent),
        'X-Metadata-Written': result.embedded.written.join(','),
        'X-Metadata-Skipped': result.embedded.skipped.join(','),
      },
    });
  } catch (error) {
    if (error instanceof ProcessingError) return fail(error.message, error.status);
    return fail('The image could not be optimized.', 500);
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    enabled: Boolean(process.env.IMAGE_SEO_API_KEY),
    usage: {
      method: 'POST',
      headers: { 'x-api-key': '<your key>', 'content-type': 'application/json' },
      body: {
        image_url: 'https://example.com/photo.jpg',
        output_format: 'jpg',
        quality: 82,
        max_width: 1600,
        response: 'binary | json',
        metadata: {
          title: 'Orthopedic Shoe Last',
          subject: 'Custom shoe last for medicated insoles',
          description: 'Precision 3D orthotic shoe last.',
          alt_text: 'Close-up of a custom orthopedic shoe last',
          primary_keyword: 'orthopedic shoe last',
          secondary_keywords: ['custom shoe last design'],
          author: 'Acme Footwear',
          copyright: '© 2026 Acme Footwear',
        },
      },
    },
  });
}
