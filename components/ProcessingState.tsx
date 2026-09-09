'use client';

import { useEffect, useState } from 'react';

import { CheckIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';

const STAGES = [
  { label: 'Uploading image…', detail: 'Sending the file to the local processor', startsAt: 0 },
  { label: 'Optimizing…', detail: 'Resizing and re-encoding with sharp', startsAt: 0.9 },
  { label: 'Embedding metadata…', detail: 'Writing your fields into the image binary', startsAt: 2 },
];

/**
 * Processing is local and usually sub-second, so the stages are a short,
 * honest description of the pipeline rather than a fake progress bar.
 */
export function ProcessingState() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setElapsed((Date.now() - started) / 1000), 150);
    return () => window.clearInterval(timer);
  }, []);

  const activeIndex = STAGES.reduce(
    (current, stage, index) => (elapsed >= stage.startsAt ? index : current),
    0,
  );

  return (
    <section className="card animate-rise p-6 sm:p-8" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3">
        <span className="relative flex h-10 w-10 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-2 border-accent-line" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-fg">
            {STAGES[activeIndex].label}
          </h2>
          <p className="text-sm text-fg-muted">{STAGES[activeIndex].detail}</p>
        </div>
      </div>

      <ol className="mt-6 flex flex-col gap-3">
        {STAGES.map((stage, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li key={stage.label} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition',
                  done && 'border-accent bg-accent text-white',
                  active && 'border-accent bg-surface text-accent',
                  !done && !active && 'border-line bg-surface text-fg-subtle',
                )}
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-sm transition',
                  done && 'text-fg-muted',
                  active && 'font-medium text-fg',
                  !done && !active && 'text-fg-subtle',
                )}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    </section>
  );
}
