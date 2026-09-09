'use client';

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';

import { GaugeIcon, ImageIcon } from '@/components/Icons';
import { cn, formatBytes, formatDimensions } from '@/lib/utils';

/** A preview source plus the numbers shown beneath it. */
interface PreviewImage {
  url: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  format: string | null;
}

function Preview({ label, image, accent }: { label: string; image: PreviewImage; accent?: boolean }) {
  const [broken, setBroken] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-white',
        accent ? 'border-brand-200 ring-1 ring-brand-100' : 'border-ink-200',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-4 py-2.5">
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-[0.12em]',
            accent ? 'text-brand-600' : 'text-ink-400',
          )}
        >
          {label}
        </span>
        {image.format ? (
          <span className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-ink-600">
            {image.format}
          </span>
        ) : null}
      </div>

      <div className="checkerboard flex min-h-48 flex-1 items-center justify-center p-3">
        {image.url && !broken ? (
          <img
            src={image.url}
            alt={`${label} preview`}
            onError={() => setBroken(true)}
            className="max-h-64 w-auto max-w-full rounded-lg object-contain shadow-sm"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-ink-300">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">Preview unavailable</span>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-px border-t border-ink-100 bg-ink-100 text-sm">
        <div className="bg-white px-4 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-ink-400">File size</dt>
          <dd className="mt-0.5 font-semibold text-ink-900">{formatBytes(image.size_bytes)}</dd>
        </div>
        <div className="bg-white px-4 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-ink-400">Dimensions</dt>
          <dd className="mt-0.5 font-semibold text-ink-900">
            {formatDimensions(image.width, image.height)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

interface ImageComparisonProps {
  original: PreviewImage;
  optimized: PreviewImage;
  reductionPercent: number | null;
}

export function ImageComparison({ original, optimized, reductionPercent }: ImageComparisonProps) {
  const saved =
    original.size_bytes && optimized.size_bytes
      ? Math.max(0, original.size_bytes - optimized.size_bytes)
      : null;

  const improved = reductionPercent !== null && reductionPercent > 0;

  return (
    <section className="card animate-rise p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">Before & after</h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Same image, smaller payload — and a filename search engines can read.
          </p>
        </div>

        <div
          className={cn(
            'flex items-center gap-3 rounded-xl px-4 py-3',
            improved ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-600',
          )}
        >
          <GaugeIcon className="h-5 w-5" />
          <div>
            <p className="text-xl font-bold leading-none">
              {reductionPercent === null ? '—' : `${reductionPercent.toFixed(1)}%`}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide">
              {saved !== null ? `${formatBytes(saved)} saved` : 'size reduction'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Preview label="Original" image={original} />
        <Preview label="Optimized" image={optimized} accent />
      </div>
    </section>
  );
}
