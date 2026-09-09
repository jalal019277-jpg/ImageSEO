'use client';

import { CheckIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';
import type { OutputFormat } from '@/types';

const FORMATS: Array<{
  value: OutputFormat;
  label: string;
  blurb: string;
  badge?: string;
}> = [
  {
    value: 'png',
    label: 'PNG',
    blurb: 'Lossless, keeps transparency. Best for logos and flat graphics.',
  },
  {
    value: 'jpg',
    label: 'JPG / JPEG',
    blurb: 'Universally supported. Best for photos on legacy platforms.',
  },
  {
    value: 'webp',
    label: 'WEBP',
    blurb: 'Smallest files at the same quality. Best for modern web pages.',
    badge: 'Recommended',
  },
];

interface FormatSelectorProps {
  value: OutputFormat;
  onChange: (value: OutputFormat) => void;
  disabled?: boolean;
}

export function FormatSelector({ value, onChange, disabled }: FormatSelectorProps) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="text-sm font-medium text-ink-800">Output format</legend>
      <p className="mt-0.5 text-xs text-ink-500">
        The optimized file is converted to this format before download.
      </p>
      <div
        role="radiogroup"
        aria-label="Output format"
        className="mt-3 grid gap-3 sm:grid-cols-3"
      >
        {FORMATS.map((format) => {
          const selected = value === format.value;
          return (
            <button
              key={format.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(format.value)}
              className={cn(
                'group relative flex h-full flex-col rounded-xl border p-4 text-left transition',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
                selected
                  ? 'border-brand-500 bg-brand-50/70 shadow-[0_10px_30px_-18px_rgba(79,70,229,0.9)]'
                  : 'border-ink-200 bg-white hover:border-brand-200 hover:bg-brand-50/30',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold tracking-tight',
                    selected ? 'text-brand-700' : 'text-ink-800',
                  )}
                >
                  {format.label}
                </span>
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border transition',
                    selected
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-ink-300 bg-white text-transparent',
                  )}
                >
                  <CheckIcon className="h-3 w-3" strokeWidth={3} />
                </span>
              </span>
              <span className="mt-1.5 text-xs leading-relaxed text-ink-500">{format.blurb}</span>
              {format.badge ? (
                <span className="mt-3 inline-flex w-fit rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700">
                  {format.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
