'use client';

import { useState } from 'react';

import { ImageComparison } from '@/components/ImageComparison';
import { SeoMetadataCard } from '@/components/SeoMetadataCard';
import { AlertIcon, DownloadIcon, RefreshIcon } from '@/components/Icons';
import { downloadImage, downloadJson } from '@/lib/download';
import { buildSeoExport, safeFilename } from '@/lib/utils';
import type { OptimizeResult } from '@/types';

interface ResultsPanelProps {
  result: OptimizeResult;
  /** Object URL of the file the user picked, for the "before" preview. */
  originalPreviewUrl: string | null;
  onReset: () => void;
}

export function ResultsPanel({ result, originalPreviewUrl, onReset }: ResultsPanelProps) {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const filename = safeFilename(result.seo.filename, result.optimized.format);

  async function handleDownloadImage() {
    setDownloadError(null);
    try {
      await downloadImage(result.optimized.data_url, filename);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'The download failed.');
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
          Optimized and tagged
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
        original={{ ...result.original, url: originalPreviewUrl }}
        optimized={{ ...result.optimized, url: result.optimized.data_url }}
        reductionPercent={result.size_reduction_percent}
      />

      <section className="card p-6 sm:p-7">
        <button
          type="button"
          onClick={handleDownloadImage}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-18px_rgba(79,70,229,0.95)] transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >
          <DownloadIcon className="h-5 w-5" />
          Download Optimized Image
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
        embedded={result.embedded}
        onDownloadJson={handleDownloadJson}
      />
    </div>
  );
}
