import type {
  ImageDetails,
  ImageSeoRequest,
  ImageSeoResult,
  SeoMetadata,
} from '@/types';

/**
 * n8n workflows are hand-built, so the exact response shape varies between
 * instances (a bare object, an array of items, `{ data: ... }`, `{ json: ... }`,
 * snake_case vs camelCase...). These helpers flatten whatever comes back into
 * the single `ImageSeoResult` the UI understands, without throwing on gaps.
 */

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Unwrap the common n8n envelopes until we reach the payload object. */
function unwrap(input: unknown, depth = 0): Json {
  if (depth > 6) return isObject(input) ? input : {};
  if (Array.isArray(input)) return unwrap(input[0], depth + 1);
  if (!isObject(input)) return {};

  const envelopeKeys = ['json', 'data', 'result', 'body', 'response', 'output'];
  for (const key of envelopeKeys) {
    const inner = input[key];
    // Only unwrap when the envelope is the *only* meaningful thing in there,
    // otherwise sibling fields would be dropped.
    if ((isObject(inner) || Array.isArray(inner)) && Object.keys(input).length <= 2) {
      return unwrap(inner, depth + 1);
    }
  }
  return input;
}

/**
 * LLM and AI Agent nodes hand their JSON back as text, often wrapped in a
 * markdown code fence. Returns the parsed object, or null if it isn't JSON.
 */
function parseJsonString(value: unknown): Json | null {
  if (typeof value !== 'string') return null;

  let text = value.trim();
  if (!text) return null;

  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(text);
  if (fenced) text = fenced[1].trim();

  if (!text.startsWith('{') && !text.startsWith('[')) return null;

  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) return isObject(parsed[0]) ? parsed[0] : null;
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Walks the payload and collects every JSON object hiding inside a string. */
function collectJsonStrings(value: unknown, found: Json[], depth = 0): void {
  if (depth > 4 || found.length > 8) return;

  if (typeof value === 'string') {
    const parsed = parseJsonString(value);
    if (parsed) {
      found.push(parsed);
      collectJsonStrings(parsed, found, depth + 1);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectJsonStrings(item, found, depth + 1);
    return;
  }

  if (isObject(value)) {
    for (const item of Object.values(value)) collectJsonStrings(item, found, depth + 1);
  }
}

function pick(source: Json, keys: string[]): unknown {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    // Tolerates "184320", "184320 bytes", "180.5 KB".
    const match = value.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    if (!match) return null;
    const parsed = Number(match[0]);
    if (!Number.isFinite(parsed)) return null;
    if (/kb/i.test(value)) return Math.round(parsed * 1024);
    if (/mb/i.test(value)) return Math.round(parsed * 1024 * 1024);
    return parsed;
  }
  return null;
}

function asKeywordArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item) ?? '').filter(Boolean);
  }
  const text = asString(value);
  if (!text) return [];
  return text
    .split(/[,\n;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mimeForFormat(format: string | null): string {
  if (format === 'png') return 'image/png';
  if (format === 'jpg' || format === 'jpeg') return 'image/jpeg';
  return 'image/webp';
}

/** Turn a bare base64 blob into a usable `data:` URL. */
function toImageSource(value: unknown, format: string | null): string | null {
  const raw = asString(value);
  if (!raw) return null;
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  if (raw.length > 128 && /^[A-Za-z0-9+/=\s]+$/.test(raw)) {
    return `data:${mimeForFormat(format)};base64,${raw.replace(/\s/g, '')}`;
  }
  return raw;
}

function nestedSection(source: Json, keys: string[]): Json {
  for (const key of keys) {
    const value = source[key];
    if (isObject(value)) return value;
  }
  return {};
}

function shortFormat(value: string | null): string | null {
  if (!value) return null;
  return value.replace(/^.*\//, '').replace(/^\./, '').toLowerCase();
}

/**
 * Builds the prefixed lookup keys for one field, in both snake_case and
 * camelCase (`optimized_size`, `optimizedsize`, `optimizedSize`, ...).
 */
function prefixed(prefixes: string[], keys: string[]): string[] {
  const out: string[] = [];
  for (const prefix of prefixes) {
    for (const key of keys) {
      out.push(`${prefix}${key}`);
      if (!prefix.endsWith('_')) {
        out.push(`${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`);
      }
    }
  }
  return Array.from(new Set(out));
}

function readImageDetails(
  scope: Json,
  prefixes: string[],
  fallbackFormat: string | null,
): ImageDetails {
  const format =
    shortFormat(
      asString(
        pick(scope, [
          ...prefixed(prefixes, ['format']),
          'format',
          'mime_type',
          'mimeType',
          'extension',
        ]),
      ),
    ) ?? fallbackFormat;

  return {
    url: toImageSource(
      pick(scope, [
        ...prefixed(prefixes, ['url', 'image_url', 'imageUrl', 'image', 'base64', 'data']),
        'url',
        'image_url',
        'imageUrl',
        'src',
        'base64',
        'data',
      ]),
      format,
    ),
    size_bytes: asNumber(
      pick(scope, [
        ...prefixed(prefixes, ['size', 'size_bytes', 'sizeBytes', 'bytes', 'file_size', 'fileSize']),
        'size',
        'size_bytes',
        'sizeBytes',
        'bytes',
        'file_size',
        'fileSize',
      ]),
    ),
    width: asNumber(pick(scope, [...prefixed(prefixes, ['width']), 'width'])),
    height: asNumber(pick(scope, [...prefixed(prefixes, ['height']), 'height'])),
    format,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readSeo(root: Json, request: ImageSeoRequest): SeoMetadata {
  const scope: Json = {
    ...root,
    ...nestedSection(root, [
      'seo',
      'seo_data',
      'seoData',
      'metadata',
      'seo_metadata',
      'seoMetadata',
    ]),
  };

  const secondary = asKeywordArray(
    pick(scope, ['secondary_keywords', 'secondaryKeywords', 'keywords', 'supporting_keywords']),
  );

  const fallbackName =
    slugify(request.brand.primary_keyword || request.brand.company_name || '') || 'optimized-image';

  const filename =
    asString(
      pick(scope, ['filename', 'file_name', 'fileName', 'seo_filename', 'seoFilename', 'name']),
    ) ?? `${fallbackName}.${request.output_format}`;

  return {
    filename,
    alt_text: asString(pick(scope, ['alt_text', 'altText', 'alt', 'image_alt'])) ?? '',
    title: asString(pick(scope, ['title', 'seo_title', 'image_title'])) ?? '',
    caption: asString(pick(scope, ['caption', 'image_caption'])) ?? '',
    description:
      asString(
        pick(scope, ['description', 'seo_description', 'meta_description', 'metaDescription']),
      ) ?? '',
    primary_keyword:
      asString(pick(scope, ['primary_keyword', 'primaryKeyword', 'focus_keyword'])) ??
      request.brand.primary_keyword,
    secondary_keywords: secondary.length ? secondary : request.brand.secondary_keywords,
  };
}

export function normalizeN8nResponse(payload: unknown, request: ImageSeoRequest): ImageSeoResult {
  const envelope = unwrap(payload);

  // Fold any JSON-in-a-string back into the payload. The parsed content is the
  // more specific answer, so it wins over the fields around it.
  const embedded: Json[] = [];
  collectJsonStrings(envelope, embedded);
  const root: Json = embedded.length ? Object.assign({}, envelope, ...embedded) : envelope;

  const originalScope: Json = {
    ...root,
    ...nestedSection(root, ['original', 'original_image', 'originalImage', 'source']),
  };
  const optimizedScope: Json = {
    ...root,
    ...nestedSection(root, [
      'optimized',
      'optimized_image',
      'optimizedImage',
      'output',
      'result_image',
    ]),
  };

  const original = readImageDetails(originalScope, ['original_', 'original', 'source_'], null);
  const optimized = readImageDetails(
    optimizedScope,
    ['optimized_', 'optimized', 'output_'],
    request.output_format,
  );

  // The submitted URL is always a safe fallback for the "before" preview.
  if (!original.url) original.url = request.image_url;
  if (!optimized.format) optimized.format = request.output_format;

  let reduction = asNumber(
    pick(root, [
      'size_reduction_percent',
      'sizeReductionPercent',
      'reduction_percent',
      'reductionPercent',
      'savings_percent',
      'reduction',
    ]),
  );

  if (reduction === null && original.size_bytes && optimized.size_bytes && original.size_bytes > 0) {
    reduction = ((original.size_bytes - optimized.size_bytes) / original.size_bytes) * 100;
  }
  if (reduction !== null) reduction = Math.round(reduction * 10) / 10;

  const aiFlag = pick(root, ['use_ai_analysis', 'useAiAnalysis', 'ai_analysis_used', 'ai_analysis']);

  return {
    original,
    optimized,
    seo: readSeo(root, request),
    size_reduction_percent: reduction,
    use_ai_analysis: typeof aiFlag === 'boolean' ? aiFlag : request.use_ai_analysis,
    // The untouched response, so the UI can show exactly what n8n sent back.
    raw: payload,
  };
}
