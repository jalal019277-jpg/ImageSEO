import sharp from 'sharp';

import { buildXmpPacket, describeEmbeddedFields, embedMetadata } from '@/lib/metadata';
import type { ImageDetails, OptimizeOptions, OptimizeResult, SeoMetadata } from '@/types';

const MIME_BY_FORMAT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

export class ProcessingError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ProcessingError';
    this.status = status;
  }
}

/**
 * Resizes and re-encodes the image, then writes the metadata into the result.
 * Everything runs in-process; nothing leaves the server.
 */
export async function optimizeImage(
  input: Buffer,
  options: OptimizeOptions,
  seo: SeoMetadata,
): Promise<OptimizeResult> {
  let sourceMeta: Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>;

  try {
    sourceMeta = await sharp(input, { failOn: 'error' }).metadata();
  } catch {
    throw new ProcessingError('That file could not be read as an image.');
  }

  if (!sourceMeta.width || !sourceMeta.height) {
    throw new ProcessingError('That file could not be read as an image.');
  }

  const original: ImageDetails = {
    size_bytes: input.length,
    width: sourceMeta.width,
    height: sourceMeta.height,
    format: sourceMeta.format ?? 'unknown',
  };

  // Only ever scale down — enlarging a photo adds bytes without adding detail.
  let pipeline = sharp(input, { failOn: 'error' }).rotate();
  if (options.max_width && options.max_width < sourceMeta.width) {
    pipeline = pipeline.resize({ width: options.max_width, withoutEnlargement: true });
  }

  const quality = Math.min(100, Math.max(1, Math.round(options.quality)));

  if (options.output_format === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  } else if (options.output_format === 'jpg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else {
    // WebP is the one format whose metadata sharp writes correctly itself.
    pipeline = pipeline.webp({ quality }).withXmp(buildXmpPacket(seo));
  }

  let encoded: Buffer;
  try {
    encoded = await pipeline.toBuffer();
  } catch (error) {
    throw new ProcessingError(
      error instanceof Error ? `Encoding failed: ${error.message}` : 'Encoding failed.',
      500,
    );
  }

  const withMetadata = embedMetadata(encoded, options.output_format, seo);

  // Read the encoded result back so the reported dimensions are the real ones.
  const outMeta = await sharp(withMetadata)
    .metadata()
    .catch(() => null);

  const mime = MIME_BY_FORMAT[options.output_format] ?? 'application/octet-stream';

  return {
    original,
    optimized: {
      size_bytes: withMetadata.length,
      width: outMeta?.width ?? null,
      height: outMeta?.height ?? null,
      format: options.output_format,
      data_url: `data:${mime};base64,${withMetadata.toString('base64')}`,
    },
    size_reduction_percent:
      Math.round(((input.length - withMetadata.length) / input.length) * 1000) / 10,
    seo,
    embedded: describeEmbeddedFields(options.output_format, seo),
  };
}
