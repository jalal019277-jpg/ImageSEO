'use client';

import { CopyButton, CopyField } from '@/components/CopyField';
import { CodeIcon, DownloadIcon, SparklesIcon } from '@/components/Icons';
import type { SeoMetadata } from '@/types';

interface SeoMetadataCardProps {
  seo: SeoMetadata;
  usedAiAnalysis: boolean;
  onDownloadJson: () => void;
}

export function SeoMetadataCard({ seo, usedAiAnalysis, onDownloadJson }: SeoMetadataCardProps) {
  const htmlSnippet = `<img src="${seo.filename}" alt="${seo.alt_text}" title="${seo.title}" width="" height="" loading="lazy" />`;

  return (
    <section className="card animate-rise p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">
              Generated SEO metadata
            </h2>
            <p className="mt-0.5 text-sm text-ink-500">
              {usedAiAnalysis
                ? 'Written from the image contents and your brand details.'
                : 'Written from your brand details (AI image analysis was off).'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDownloadJson}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          <DownloadIcon className="h-4 w-4" />
          Download SEO Data
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <CopyField label="Filename" value={seo.filename} />
        <CopyField label="Title" value={seo.title} />
        <CopyField label="Alt text" value={seo.alt_text} multiline />
        <CopyField label="Caption" value={seo.caption} multiline />
        <CopyField label="Description" value={seo.description} multiline />
        <div className="grid gap-3">
          <CopyField label="Primary keyword" value={seo.primary_keyword} />
          <CopyField
            label="Secondary keywords"
            value={seo.secondary_keywords.join(', ')}
            chips={seo.secondary_keywords}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-ink-200 bg-ink-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-300">
            <CodeIcon className="h-3.5 w-3.5" />
            Ready-to-paste HTML
          </p>
          <CopyButton value={htmlSnippet} label="Copy snippet" />
        </div>
        <pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-brand-100">
          <code>{htmlSnippet}</code>
        </pre>
      </div>
    </section>
  );
}
