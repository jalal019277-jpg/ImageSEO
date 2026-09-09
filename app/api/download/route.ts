import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024;

/** Blocks loopback / link-local / private ranges so the proxy can't be abused. */
function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) return true;
  if (host === '::1' || host === '0.0.0.0') return true;

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!ipv4) return false;

  const [a, b] = ipv4.slice(1).map(Number);
  if (a === 10 || a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function sanitizeFilename(value: string | null): string {
  const cleaned = (value ?? '')
    .replace(/[\\/:*?"<>|\r\n]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
  return cleaned || 'optimized-image';
}

/**
 * Streams a remote image back to the browser as an attachment. This exists so
 * cross-origin images (which ignore the HTML `download` attribute) still save
 * under the AI-generated SEO filename.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url');
  const filename = sanitizeFilename(searchParams.get('filename'));

  if (!target) {
    return NextResponse.json({ error: 'A url query parameter is required.' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: 'The url query parameter is invalid.' }, { status: 400 });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only http:// and https:// URLs are supported.' }, { status: 400 });
  }
  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: 'That host is not allowed.' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), {
      cache: 'no-store',
      redirect: 'follow',
      headers: { Accept: 'image/*,*/*;q=0.8' },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'The image could not be fetched.',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: `The image could not be fetched (HTTP ${upstream.status}).` },
      { status: 502 },
    );
  }

  const declaredLength = Number(upstream.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
    return NextResponse.json({ error: 'That file is too large to download here.' }, { status: 413 });
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
