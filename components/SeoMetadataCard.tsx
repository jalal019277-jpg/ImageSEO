'use client';

import { CopyButton, CopyField } from '@/components/CopyField';
import { CheckIcon, CodeIcon, DownloadIcon, TagIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';
import type { EmbeddedFields, SeoMetadata } from '@/types';

interface SeoMetadataCardProps {
  seo: SeoMetadata;
  embedded: EmbeddedFields;
  onDownloadJson: () => void;
}

export function SeoMetadataCard({ seo, embedded, onDownloadJson }: SeoMetadataCardProps) {
  const htmlSnippet =
    `<img src="${seo.filename}" alt="${seo.alt_text}" title="${seo.title}" ` +
    `width="" height="" loading="lazy" decoding="async" />`;

  return (
    <section className="card animate-rise p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent ring-1 ring-accent-line">
            <TagIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-fg">SEO metadata</h2>
            <p className="mt-0.5 text-sm text-fg-muted">
              Copy any field, or export the whole set as JSON.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDownloadJson}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-fg transition hover:border-accent hover:text-accent-fg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
        >
          <DownloadIcon className="h-4 w-4" />
          Download SEO Data
        </button>
      </div>

      {/* Embedded-field summary ------------------------------------------ */}
      <div className="mt-5 rounded-xl border border-ok-line bg-ok-soft/70 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ok-fg">
          <CheckIcon className="h-4 w-4" strokeWidth={3} />
          Written into the file — visible in Windows → Properties → Details
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {embedded.written.length ? (
            embedded.written.map((field) => (
              <span
                key={field}
                className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ok-fg ring-1 ring-ok-line"
              >
                {field}
              </span>
            ))
          ) : (
            <span className="text-xs text-ok-fg/80">
              Nothing to embed — fill in the metadata fields above.
            </span>
          )}
        </div>

        {embedded.skipped.length ? (
          <p className="mt-3 text-xs leading-relaxed text-ok-fg/80">
            <span className="font-semibold">Skipped:</span> {embedded.skipped.join(', ')} — Windows only
            reads {embedded.skipped.length === 1 ? 'this field' : 'these fields'} from JPG files. Switch
            the output format to JPG to include {embedded.skipped.length === 1 ? 'it' : 'them'}.
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <CopyField label="Filename" value={seo.filename} />
        <CopyField label="Title" value={seo.title} />
        <CopyField label="Subject" value={seo.subject} multiline />
        <CopyField label="Description" value={seo.description} multiline />
        <CopyField label="Alt text" value={seo.alt_text} multiline />
        <div className="grid gap-3">
          <CopyField label="Primary keyword" value={seo.primary_keyword} />
          <CopyField
            label="Secondary keywords"
            value={seo.secondary_keywords.join(', ')}
            chips={seo.secondary_keywords}
          />
        </div>
        <CopyField label="Author" value={seo.author} />
        <CopyField label="Copyright" value={seo.copyright} />
      </div>

      <div className={cn('mt-4 rounded-xl border border-line bg-code p-4')}>
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
            <CodeIcon className="h-3.5 w-3.5" />
            Ready-to-paste HTML
          </p>
          <CopyButton value={htmlSnippet} label="Copy snippet" />
        </div>
        <pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-code-fg">
          <code>{htmlSnippet}</code>
        </pre>
      </div>
    </section>
  );
}
