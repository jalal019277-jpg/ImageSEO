import type { ImageSeoRequest, ImageSeoResult } from '@/types';
import { normalizeN8nResponse } from '@/services/n8nResponse';

export class N8nError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status = 502, details?: string) {
    super(message);
    this.name = 'N8nError';
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_TIMEOUT_MS = 240_000;

function timeoutMs(): number {
  const configured = Number(process.env.N8N_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TIMEOUT_MS;
}

/**
 * Forwards the request to the n8n webhook. The webhook URL and any auth token
 * live in environment variables so they are never exposed to the browser.
 */
export async function runImageSeoWorkflow(request: ImageSeoRequest): Promise<ImageSeoResult> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new N8nError(
      'The optimizer is not configured yet.',
      500,
      'Set N8N_WEBHOOK_URL in your environment (.env.local locally, Project Settings on Vercel).',
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const authHeader = process.env.N8N_WEBHOOK_AUTH_HEADER || 'x-api-key';
  const authToken = process.env.N8N_WEBHOOK_AUTH_TOKEN;
  if (authToken) headers[authHeader] = authToken;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    throw new N8nError(
      aborted ? 'The workflow took too long to respond.' : 'Could not reach the optimization workflow.',
      aborted ? 504 : 502,
      error instanceof Error ? error.message : undefined,
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();

  if (!response.ok) {
    throw new N8nError(
      `The workflow returned an error (HTTP ${response.status}).`,
      response.status === 404 ? 502 : 502,
      text.slice(0, 500) || undefined,
    );
  }

  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new N8nError(
      'The workflow returned a response that is not valid JSON.',
      502,
      text.slice(0, 500) || undefined,
    );
  }

  return normalizeN8nResponse(payload, request);
}
