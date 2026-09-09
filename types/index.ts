/**
 * Shared contracts between the browser, the Next.js API route and the n8n
 * workflow. Everything the UI renders flows through `ImageSeoResult`.
 */

export type OutputFormat = 'png' | 'jpg' | 'webp';

export const OUTPUT_FORMATS: OutputFormat[] = ['png', 'jpg', 'webp'];

/** Company/brand context that steers the AI copywriting inside n8n. */
export interface BrandInfo {
  company_name: string;
  industry: string;
  target_audience: string;
  target_market: string;
  primary_keyword: string;
  secondary_keywords: string[];
  brand_description: string;
}

/** Exact JSON shape POSTed to the n8n webhook. */
export interface ImageSeoRequest {
  image_url: string;
  output_format: OutputFormat;
  use_ai_analysis: boolean;
  brand: BrandInfo;
}

/** What the form holds while the user types (keywords stay a raw string). */
export interface ImageSeoFormValues {
  image_url: string;
  output_format: OutputFormat;
  use_ai_analysis: boolean;
  company_name: string;
  industry: string;
  target_audience: string;
  target_market: string;
  primary_keyword: string;
  secondary_keywords: string;
  brand_description: string;
}

export interface ImageDetails {
  /** Displayable/downloadable source: an https URL or a data: URL. */
  url: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  format: string | null;
}

export interface SeoMetadata {
  filename: string;
  alt_text: string;
  title: string;
  caption: string;
  description: string;
  primary_keyword: string;
  secondary_keywords: string[];
}

export interface ImageSeoResult {
  original: ImageDetails;
  optimized: ImageDetails;
  seo: SeoMetadata;
  /** Percentage saved, e.g. 62.4 means the file is 62.4% smaller. */
  size_reduction_percent: number | null;
  use_ai_analysis: boolean;
  /** Anything n8n returned that we did not map, kept for the JSON export. */
  raw?: unknown;
}

export interface ApiErrorBody {
  error: string;
  details?: string;
}

export type ApiResponse = ImageSeoResult | ApiErrorBody;

export function isApiError(value: ApiResponse): value is ApiErrorBody {
  return typeof (value as ApiErrorBody)?.error === 'string';
}
