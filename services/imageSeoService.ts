import type { ImageSeoFormValues, OptimizeResult } from '@/types';

export { MAX_UPLOAD_BYTES } from '@/lib/limits';

export class ImageSeoRequestError extends Error {
  details?: string;

  constructor(message: string, details?: string) {
    super(message);
    this.name = 'ImageSeoRequestError';
    this.details = details;
  }
}

export function parseKeywords(value: string): string[] {
  return value
    .split(/[,\n;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildFormData(file: File, values: ImageSeoFormValues): FormData {
  const form = new FormData();
  form.set('file', file);
  form.set('output_format', values.output_format);
  form.set('quality', String(values.quality));
  if (values.max_width) form.set('max_width', String(values.max_width));

  const fields: Array<keyof ImageSeoFormValues> = [
    'filename',
    'title',
    'alt_text',
    'subject',
    'description',
    'primary_keyword',
    'secondary_keywords',
    'author',
    'copyright',
  ];
  for (const field of fields) form.set(field, String(values[field] ?? ''));

  return form;
}

/** Uploads the image to our own API route, which does all the work locally. */
export async function optimizeImage(file: File, values: ImageSeoFormValues): Promise<OptimizeResult> {
  const response = await fetch('/api/image-seo', {
    method: 'POST',
    body: buildFormData(file, values),
  });

  const payload = (await response.json().catch(() => null)) as
    | (OptimizeResult & { error?: string; details?: string })
    | null;

  if (!response.ok || !payload || payload.error) {
    throw new ImageSeoRequestError(
      payload?.error || `Optimization failed (HTTP ${response.status}).`,
      payload?.details,
    );
  }

  return payload;
}
