import type { ImageSeoResult, OutputFormat } from '@/types';

/** Joins conditional class names, ignoring anything that is not a string. */
export function cn(...classes: unknown[]): string {
  return classes.filter((value): value is string => typeof value === 'string' && value !== '').join(' ');
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDimensions(
  width: number | null | undefined,
  height: number | null | undefined,
): string {
  if (!width || !height) return '—';
  return `${Math.round(width)} × ${Math.round(height)} px`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${value > 0 ? '' : ''}${value.toFixed(1)}%`;
}

/** Basic URL sanity check used for inline form validation. */
export function validateImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'An image URL is required.';

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return 'Enter a full URL, including https://';
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return 'Only http:// and https:// URLs are supported.';
  }
  if (!parsed.hostname.includes('.')) {
    return 'That hostname does not look valid.';
  }
  return null;
}

const EXTENSION_BY_FORMAT: Record<OutputFormat, string> = {
  png: 'png',
  jpg: 'jpg',
  webp: 'webp',
};

/** Guarantees the download filename is safe and carries the right extension. */
export function safeFilename(filename: string, format: OutputFormat): string {
  const extension = EXTENSION_BY_FORMAT[format] ?? 'webp';
  const cleaned = filename
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

  const base = cleaned || 'optimized-image';
  if (new RegExp(`\\.(png|jpe?g|webp)$`, 'i').test(base)) return base;
  return `${base}.${extension}`;
}

/** The JSON blob offered by the "Download SEO Data" button. */
export function buildSeoExport(result: ImageSeoResult) {
  return {
    generated_at: new Date().toISOString(),
    generated_by: 'AI Image SEO Optimizer',
    seo: result.seo,
    image: {
      original: result.original,
      optimized: result.optimized,
      size_reduction_percent: result.size_reduction_percent,
    },
    settings: {
      output_format: result.optimized.format,
      use_ai_analysis: result.use_ai_analysis,
    },
  };
}
