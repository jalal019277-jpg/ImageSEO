/**
 * Shared contracts between the browser and the local processing API route.
 * Everything happens inside Next.js — there is no external service.
 */

export type OutputFormat = 'png' | 'jpg' | 'webp';

export const OUTPUT_FORMATS: OutputFormat[] = ['png', 'jpg', 'webp'];

/** Formats whose "Subject" field Windows Explorer can display. */
export const FORMATS_WITH_SUBJECT: OutputFormat[] = ['jpg'];

/** Metadata the user types in. Most of it is written into the image binary. */
export interface SeoMetadata {
  filename: string;
  title: string;
  alt_text: string;
  subject: string;
  description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  author: string;
  copyright: string;
}

export interface OptimizeOptions {
  output_format: OutputFormat;
  /** 1-100, ignored for PNG (which is lossless). */
  quality: number;
  /** Long-edge cap in pixels; null leaves the image at its original size. */
  max_width: number | null;
}

/** The form state, where keywords are still a raw comma-separated string. */
export interface ImageSeoFormValues extends OptimizeOptions {
  filename: string;
  title: string;
  alt_text: string;
  subject: string;
  description: string;
  primary_keyword: string;
  secondary_keywords: string;
  author: string;
  copyright: string;
}

export interface ImageDetails {
  size_bytes: number;
  width: number | null;
  height: number | null;
  format: string;
}

/** Which Windows Explorer "Details" fields the output actually carries. */
export interface EmbeddedFields {
  written: string[];
  skipped: string[];
}

export interface OptimizeResult {
  original: ImageDetails;
  optimized: ImageDetails & { data_url: string };
  size_reduction_percent: number;
  seo: SeoMetadata;
  embedded: EmbeddedFields;
}

export interface ApiErrorBody {
  error: string;
  details?: string;
}
