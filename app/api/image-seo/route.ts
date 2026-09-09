import { NextResponse } from 'next/server';

import { ProcessingError, optimizeImage } from '@/lib/imageProcessing';
import { MAX_UPLOAD_BYTES } from '@/lib/limits';
import { OUTPUT_FORMATS, type OptimizeOptions, type OutputFormat, type SeoMetadata } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff'];

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function keywords(value: FormDataEntryValue | null): string[] {
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

function badRequest(error: string, details?: string) {
  return NextResponse.json({ error, details }, { status: 400 });
}

/**
 * Optimizes an uploaded image and writes the submitted metadata into the file.
 * Runs entirely inside this process — no external services involved.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest('The upload could not be read. Please try again.');
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return badRequest('Choose an image to optimize.');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return badRequest(
      `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${
        MAX_UPLOAD_BYTES / 1024 / 1024
      } MB.`,
      'Serverless platforms cap request bodies; resize the image or run the app locally for larger files.',
    );
  }
  if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
    return badRequest(`${file.type} files are not supported.`, 'Use JPG, PNG, WEBP, GIF, AVIF or TIFF.');
  }

  const requested = text(form.get('output_format')).toLowerCase();
  const normalized = requested === 'jpeg' ? 'jpg' : requested;
  const outputFormat: OutputFormat = OUTPUT_FORMATS.includes(normalized as OutputFormat)
    ? (normalized as OutputFormat)
    : 'webp';

  const parsedQuality = Number(text(form.get('quality')));
  const parsedMaxWidth = Number(text(form.get('max_width')));

  const options: OptimizeOptions = {
    output_format: outputFormat,
    quality: Number.isFinite(parsedQuality) && parsedQuality > 0 ? parsedQuality : 82,
    max_width: Number.isFinite(parsedMaxWidth) && parsedMaxWidth >= 16 ? Math.round(parsedMaxWidth) : null,
  };

  const title = text(form.get('title'));
  const primaryKeyword = text(form.get('primary_keyword'));

  const requestedName = text(form.get('filename'));
  const baseName =
    slugify(requestedName.replace(/\.(png|jpe?g|webp)$/i, '')) ||
    slugify(primaryKeyword) ||
    slugify(title) ||
    'optimized-image';

  const seo: SeoMetadata = {
    filename: `${baseName}.${outputFormat}`,
    title,
    alt_text: text(form.get('alt_text')),
    subject: text(form.get('subject')),
    description: text(form.get('description')),
    primary_keyword: primaryKeyword,
    secondary_keywords: keywords(form.get('secondary_keywords')),
    author: text(form.get('author')),
    copyright: text(form.get('copyright')),
  };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await optimizeImage(buffer, options, seo);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ProcessingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      {
        error: 'The image could not be optimized.',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
