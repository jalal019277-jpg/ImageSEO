import type { OptimizeResult, OutputFormat } from '@/types';

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

const EXTENSION_BY_FORMAT: Record<string, string> = {
  png: 'png',
  jpg: 'jpg',
  webp: 'webp',
};

/** Guarantees the download filename is safe and carries the right extension. */
export function safeFilename(filename: string, format: OutputFormat | string): string {
  const extension = EXTENSION_BY_FORMAT[format] ?? 'webp';
  const cleaned = filename
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

  const base = cleaned || 'optimized-image';
  if (/\.(png|jpe?g|webp)$/i.test(base)) return base;
  return `${base}.${extension}`;
}

/** The JSON blob offered by the "Download SEO Data" button. */
export function buildSeoExport(result: OptimizeResult) {
  return {
    generated_at: new Date().toISOString(),
    generated_by: 'AI Image SEO Optimizer',
    seo: result.seo,
    embedded_in_file: result.embedded,
    image: {
      original: result.original,
      optimized: {
        size_bytes: result.optimized.size_bytes,
        width: result.optimized.width,
        height: result.optimized.height,
        format: result.optimized.format,
      },
      size_reduction_percent: result.size_reduction_percent,
    },
  };
}
