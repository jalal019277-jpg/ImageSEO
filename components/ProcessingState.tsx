'use client';

import { useEffect, useState } from 'react';

import { CheckIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';

interface Stage {
  label: string;
  detail: string;
  /** Seconds after submit when this stage starts. */
  startsAt: number;
}

const STAGES: Stage[] = [
  { label: 'Fetching image…', detail: 'Downloading the source file', startsAt: 0 },
  { label: 'Analyzing image…', detail: 'Reading composition, subject and context', startsAt: 3 },
  { label: 'Generating SEO…', detail: 'Writing filename, alt text, title and description', startsAt: 9 },
  { label: 'Optimizing…', detail: 'Compressing and converting the output file', startsAt: 17 },
  { label: 'Finishing up…', detail: 'Packaging results for download', startsAt: 26 },
];

/**
 * n8n does not stream progress, so the stage list is time-based: it tells the
 * user what the workflow is doing rather than claiming exact progress.
 */
export function ProcessingState({ useAiAnalysis }: { useAiAnalysis: boolean }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      setElapsed((Date.now() - started) / 1000);
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  const stages = useAiAnalysis ? STAGES : STAGES.filter((stage) => stage.label !== 'Analyzing image…');
  const activeIndex = Math.min(
    stages.length - 1,
    stages.reduce((current, stage, index) => (elapsed >= stage.startsAt ? index : current), 0),
  );

  return (
    <section className="card animate-rise p-6 sm:p-8" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3">
        <span className="relative flex h-10 w-10 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-brand-100" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink-900">
            {stages[activeIndex]?.label ?? 'Working…'}
          </h2>
          <p className="text-sm text-ink-500">
            {stages[activeIndex]?.detail} · {Math.round(elapsed)}s elapsed
          </p>
        </div>
      </div>

      <ol className="mt-6 flex flex-col gap-3">
        {stages.map((stage, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li key={stage.label} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition',
                  done && 'border-brand-600 bg-brand-600 text-white',
                  active && 'border-brand-500 bg-white text-brand-600',
                  !done && !active && 'border-ink-200 bg-white text-ink-300',
                )}
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-sm transition',
                  done && 'text-ink-500',
                  active && 'font-medium text-ink-900',
                  !done && !active && 'text-ink-400',
                )}
              >
                {stage.label}
              </span>
              {active ? (
                <span className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
                  <span className="skeleton block h-full w-full rounded-full" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="h-40 rounded-xl skeleton" />
        <div className="h-40 rounded-xl skeleton" />
      </div>

      <p className="mt-4 text-xs text-ink-400">
        Large images with AI analysis enabled can take up to a couple of minutes. Keep this tab
        open.
      </p>
    </section>
  );
}
