import { MAX_UPLOAD_BYTES } from '@/lib/limits';

/**
 * Blocks loopback, link-local and private ranges. The v1 API accepts a URL
 * chosen by the caller, so it must not become a probe into the host's network.
 */
function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) return true;
  if (host === '::1' || host === '0.0.0.0' || host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')) {
    return true;
  }

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!ipv4) return false;

  const [a, b] = ipv4.slice(1).map(Number);
  if (a === 10 || a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

export class FetchImageError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'FetchImageError';
    this.status = status;
  }
}

/** Downloads a remote image, refusing anything unsafe or oversized. */
export async function fetchRemoteImage(rawUrl: string, maxBytes = MAX_UPLOAD_BYTES): Promise<Buffer> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new FetchImageError('image_url is not a valid URL.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new FetchImageError('image_url must use http:// or https://.');
  }
  if (isBlockedHost(parsed.hostname)) {
    throw new FetchImageError('That host is not allowed.');
  }

  let response: Response;
  try {
    response = await fetch(parsed.toString(), {
      cache: 'no-store',
      redirect: 'follow',
      headers: { Accept: 'image/*' },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new FetchImageError(
      error instanceof Error && error.name === 'TimeoutError'
        ? 'Timed out fetching image_url.'
        : 'Could not fetch image_url.',
      502,
    );
  }

  if (!response.ok) {
    throw new FetchImageError(`Could not fetch image_url (HTTP ${response.status}).`, 502);
  }

  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new FetchImageError(`That image is larger than the ${maxBytes / 1024 / 1024} MB limit.`, 413);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > maxBytes) {
    throw new FetchImageError(`That image is larger than the ${maxBytes / 1024 / 1024} MB limit.`, 413);
  }
  if (buffer.length === 0) {
    throw new FetchImageError('image_url returned an empty response.');
  }

  return buffer;
}

/** Accepts a bare base64 payload or a full data: URL. */
export function decodeBase64Image(value: string, maxBytes = MAX_UPLOAD_BYTES): Buffer {
  const cleaned = value.includes(',') && value.startsWith('data:') ? value.slice(value.indexOf(',') + 1) : value;
  const buffer = Buffer.from(cleaned.replace(/\s/g, ''), 'base64');

  if (buffer.length === 0) throw new FetchImageError('image_base64 could not be decoded.');
  if (buffer.length > maxBytes) {
    throw new FetchImageError(`That image is larger than the ${maxBytes / 1024 / 1024} MB limit.`, 413);
  }
  return buffer;
}
