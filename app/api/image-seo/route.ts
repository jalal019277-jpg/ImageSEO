import { NextResponse } from 'next/server';

import { N8nError, runImageSeoWorkflow } from '@/services/n8nClient';
import { OUTPUT_FORMATS, type ImageSeoRequest, type OutputFormat } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Image optimization plus AI copywriting can take a while inside n8n.

type Json = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function keywords(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  const raw = text(value);
  if (!raw) return [];
  return raw
    .split(/[,\n;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function badRequest(error: string, details?: string) {
  return NextResponse.json({ error, details }, { status: 400 });
}

/**
 * Receives the form submission from the browser, validates it, and forwards a
 * clean payload to the n8n webhook. The webhook URL never leaves the server.
 */
export async function POST(request: Request) {
  let body: Json;
  try {
    body = (await request.json()) as Json;
  } catch {
    return badRequest('The request body must be valid JSON.');
  }

  const imageUrl = text(body.image_url);
  if (!imageUrl) return badRequest('An image URL is required.');

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return badRequest('The image URL is not a valid URL.');
  }
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return badRequest('Only http:// and https:// image URLs are supported.');
  }

  const requestedFormat = text(body.output_format).toLowerCase();
  const normalizedFormat = requestedFormat === 'jpeg' ? 'jpg' : requestedFormat;
  const outputFormat: OutputFormat = OUTPUT_FORMATS.includes(normalizedFormat as OutputFormat)
    ? (normalizedFormat as OutputFormat)
    : 'webp';

  const brand = (typeof body.brand === 'object' && body.brand !== null ? body.brand : {}) as Json;

  const payload: ImageSeoRequest = {
    image_url: parsedUrl.toString(),
    output_format: outputFormat,
    // Anything other than an explicit `false` keeps AI analysis on.
    use_ai_analysis: body.use_ai_analysis !== false,
    brand: {
      company_name: text(brand.company_name),
      industry: text(brand.industry),
      target_audience: text(brand.target_audience),
      target_market: text(brand.target_market),
      primary_keyword: text(brand.primary_keyword),
      secondary_keywords: keywords(brand.secondary_keywords),
      brand_description: text(brand.brand_description),
    },
  };

  try {
    const result = await runImageSeoWorkflow(payload);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof N8nError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status },
      );
    }
    return NextResponse.json(
      {
        error: 'Something went wrong while optimizing the image.',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      configured: Boolean(process.env.N8N_WEBHOOK_URL),
      message: 'POST an image_url, output_format, use_ai_analysis and brand object here.',
    },
    { status: 200 },
  );
}
