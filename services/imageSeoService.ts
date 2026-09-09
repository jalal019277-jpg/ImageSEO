import type { ImageSeoFormValues, ImageSeoRequest, ImageSeoResult } from '@/types';

/** Splits the free-text secondary keyword field into a clean array. */
export function parseKeywords(value: string): string[] {
  return value
    .split(/[,\n;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Maps the form state onto the exact JSON contract the n8n workflow expects. */
export function buildRequest(values: ImageSeoFormValues): ImageSeoRequest {
  return {
    image_url: values.image_url.trim(),
    output_format: values.output_format,
    use_ai_analysis: values.use_ai_analysis,
    brand: {
      company_name: values.company_name.trim(),
      industry: values.industry.trim(),
      target_audience: values.target_audience.trim(),
      target_market: values.target_market.trim(),
      primary_keyword: values.primary_keyword.trim(),
      secondary_keywords: parseKeywords(values.secondary_keywords),
      brand_description: values.brand_description.trim(),
    },
  };
}

export class ImageSeoRequestError extends Error {
  details?: string;

  constructor(message: string, details?: string) {
    super(message);
    this.name = 'ImageSeoRequestError';
    this.details = details;
  }
}

/** Calls our own API route, which proxies to n8n with the secret webhook URL. */
export async function optimizeImage(values: ImageSeoFormValues): Promise<ImageSeoResult> {
  const response = await fetch('/api/image-seo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildRequest(values)),
  });

  const payload = (await response.json().catch(() => null)) as
    | (ImageSeoResult & { error?: string; details?: string })
    | null;

  if (!response.ok || !payload || payload.error) {
    throw new ImageSeoRequestError(
      payload?.error || `Request failed (HTTP ${response.status}).`,
      payload?.details,
    );
  }

  return payload;
}
