'use client';

import { useEffect, useState } from 'react';

import { CopyButton } from '@/components/CopyField';
import { CodeIcon, DownloadIcon, SettingsIcon } from '@/components/Icons';
import { downloadJson } from '@/lib/download';
import { cn } from '@/lib/utils';

const SAMPLE_BODY = {
  image_url: 'https://example.com/product-shot.jpg',
  output_format: 'jpg',
  quality: 82,
  max_width: 1600,
  metadata: {
    title: 'Orthopedic Shoe Last',
    subject: 'Custom shoe last for medicated insoles',
    description: 'Precision 3D orthotic shoe last, machined for medicated insole fitting.',
    alt_text: 'Close-up of a custom orthopedic shoe last on a workbench',
    primary_keyword: 'orthopedic shoe last',
    secondary_keywords: ['custom shoe last design', 'medicated insoles'],
    author: 'Acme Footwear',
    copyright: '© 2026 Acme Footwear',
  },
};

/** A single HTTP Request node — import it and fill in the credential. */
function buildWorkflow(endpoint: string) {
  return {
    name: 'Image SEO Optimizer — one node',
    nodes: [
      {
        parameters: {
          method: 'POST',
          url: endpoint,
          authentication: 'genericCredentialType',
          genericAuthType: 'httpHeaderAuth',
          sendBody: true,
          specifyBody: 'json',
          jsonBody: JSON.stringify(SAMPLE_BODY, null, 2),
          options: {
            response: { response: { responseFormat: 'file', outputPropertyName: 'data' } },
            timeout: 60000,
          },
        },
        id: 'b10m3ch5-0001-4000-8000-000000000001',
        name: 'Optimize image + embed SEO',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [0, 0],
        notes:
          'Returns the optimized image as binary. Size and metadata details arrive in the X-Image-* response headers.',
        notesInFlow: true,
      },
    ],
    connections: {},
    settings: { executionOrder: 'v1' },
    pinData: {},
  };
}

type Tab = 'n8n' | 'body' | 'curl';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'n8n', label: 'n8n setup' },
  { id: 'body', label: 'JSON body' },
  { id: 'curl', label: 'cURL' },
];

export function IntegrationSection() {
  const [tab, setTab] = useState<Tab>('n8n');
  const [origin, setOrigin] = useState('https://your-app.vercel.app');

  useEffect(() => setOrigin(window.location.origin), []);

  const endpoint = `${origin}/api/v1/optimize`;
  const bodyJson = JSON.stringify(SAMPLE_BODY, null, 2);

  const n8nSteps = [
    ['Node', 'HTTP Request'],
    ['Method', 'POST'],
    ['URL', endpoint],
    ['Authentication', 'Generic Credential Type → Header Auth'],
    ['Credential name', 'x-api-key'],
    ['Credential value', 'your IMAGE_SEO_API_KEY'],
    ['Send Body', 'On → JSON → paste the JSON body tab'],
    ['Response Format', 'File  (this is what makes the node output the image)'],
  ];

  const curl = `curl -X POST '${endpoint}' \\
  -H 'x-api-key: YOUR_API_KEY' \\
  -H 'content-type: application/json' \\
  -d '${JSON.stringify(SAMPLE_BODY)}' \\
  --output optimized.jpg`;

  const codeFor: Record<Tab, string> = { n8n: endpoint, body: bodyJson, curl };

  return (
    <section id="api" className="card scroll-mt-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent-line">
            <SettingsIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-fg">Use it from n8n</h2>
            <p className="mt-0.5 max-w-xl text-sm text-fg-muted">
              One HTTP Request node in, the finished image out. Post JSON, get the optimized file
              back as binary with the metadata already written into it.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => downloadJson(buildWorkflow(endpoint), 'image-seo-one-node.json')}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition hover:border-accent hover:text-accent-fg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
        >
          <DownloadIcon className="h-4 w-4" />
          Download n8n workflow
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20',
              tab === item.id
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-fg-muted hover:text-fg',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'n8n' ? (
          <dl className="overflow-hidden rounded-xl border border-line">
            {n8nSteps.map(([key, value], index) => (
              <div
                key={key}
                className={cn(
                  'grid gap-1 px-4 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4',
                  index % 2 ? 'bg-surface' : 'bg-surface-2/60',
                )}
              >
                <dt className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">{key}</dt>
                <dd className="break-all font-mono text-xs text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="rounded-xl border border-line bg-code p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                <CodeIcon className="h-3.5 w-3.5" />
                {tab === 'body' ? 'Request body' : 'Command line'}
              </p>
              <CopyButton value={codeFor[tab]} label="Copy" />
            </div>
            <pre className="mt-2 max-h-80 overflow-auto text-xs leading-relaxed text-code-fg">
              <code>{codeFor[tab]}</code>
            </pre>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            Turn the API on
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
            Set <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-fg">IMAGE_SEO_API_KEY</code>{' '}
            in your environment. Until you do, the endpoint stays disabled and returns 503 — it is
            never open to the public by accident.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            Response headers
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
            The binary comes back with{' '}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-fg">X-Image-Filename</code>,
            size, dimensions, reduction percent and which metadata fields were written — so one node
            gives you the file and the numbers. Send{' '}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-fg">&quot;response&quot;: &quot;json&quot;</code>{' '}
            instead if you want JSON.
          </p>
        </div>
      </div>
    </section>
  );
}
