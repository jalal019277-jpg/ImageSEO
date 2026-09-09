'use client';

/** Triggers a browser download for a Blob, cleaning up the object URL after. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadJson(data: unknown, filename: string): void {
  downloadBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    filename,
  );
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(',');
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? 'application/octet-stream';

  if (!header.includes('base64')) {
    return new Blob([decodeURIComponent(encoded)], { type: mime });
  }

  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Downloads the optimized image under its SEO filename. Remote URLs go through
 * our own proxy route so cross-origin images still save with the right name.
 */
export async function downloadImage(source: string, filename: string): Promise<void> {
  if (source.startsWith('data:')) {
    downloadBlob(dataUrlToBlob(source), filename);
    return;
  }

  const proxied = `/api/download?url=${encodeURIComponent(source)}&filename=${encodeURIComponent(filename)}`;
  const response = await fetch(proxied);

  if (!response.ok) {
    const message = await response.json().catch(() => null);
    throw new Error(message?.error || 'The image could not be downloaded.');
  }

  downloadBlob(await response.blob(), filename);
}

export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for insecure origins / older browsers.
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}
