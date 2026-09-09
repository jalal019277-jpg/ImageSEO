'use client';

import { useState } from 'react';

import { ImageComparison } from '@/components/ImageComparison';
import { RawResponsePanel } from '@/components/RawResponsePanel';
import { SeoMetadataCard } from '@/components/SeoMetadataCard';
import { AlertIcon, DownloadIcon, RefreshIcon } from '@/components/Icons';
import { downloadImage, downloadJson } from '@/lib/download';
import { buildSeoExport, safeFilename } from '@/lib/utils';
import type { ImageSeoResult, OutputFormat } from '@/types';

interface ResultsPanelProps {
  result: ImageSeoResult;
  onReset: () => void;
}

export function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Fields the workflow left empty — the UI fell back to the brand details for
  // these, so it is worth calling out rather than passing them off as generated.
  const missing = (
    [
      ['Title', result.seo.title],
      ['Alt text', result.seo.alt_text],
      ['Caption', result.seo.caption],
      ['Description', result.seo.description],
    ] as const
  )
    .filter(([, value]) => !value.trim())
    .map(([label]) => label);

  const format = (result.optimized.format ?? 'webp') as OutputFormat;
  const filename = safeFilename(result.seo.filename, format);
  const source = result.optimized.url ?? result.original.url;

  async function handleDownloadImage() {
    if (!source) {
      setDownloadError('The workflow did not return an optimized image URL.');
      return;
    }
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadImage(source, filename);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'The download failed.');
    } finally {
      setDownloading(false);
    }
  }

  function handleDownloadJson() {
    const base = filename.replace(/\.(png|jpe?g|webp)$/i, '');
    downloadJson(buildSeoExport(result), `${base || 'image'}-seo.json`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Optimization complete
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
        >
          <RefreshIcon className="h-4 w-4" />
          Optimize another image
        </button>
      </div>

      <ImageComparison
        original={result.original}
        optimized={result.optimized}
        reductionPercent={result.size_reduction_percent}
      />

      <section className="card p-6 sm:p-7">
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={downloading || !source}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-18px_rgba(79,70,229,0.95)] transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <DownloadIcon className="h-5 w-5" />
          {downloading ? 'Preparing download…' : 'Download Optimized Image'}
        </button>

        <p className="mt-3 text-center text-sm text-ink-500">
          Saves as{' '}
          <span className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-[13px] text-ink-800">
            {filename}
          </span>
        </p>

        {downloadError ? (
          <p className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-red-600">
            <AlertIcon className="h-4 w-4" />
            {downloadError}
          </p>
        ) : null}
      </section>

      <SeoMetadataCard
        seo={result.seo}
        usedAiAnalysis={result.use_ai_analysis}
        onDownloadJson={handleDownloadJson}
      />

      <RawResponsePanel raw={result.raw} missing={missing} />
    </div>
  );
}
