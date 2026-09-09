'use client';

import { useEffect, useRef, useState } from 'react';

import { CheckIcon, CopyIcon } from '@/components/Icons';
import { copyToClipboard } from '@/lib/download';
import { cn } from '@/lib/utils';

interface CopyFieldProps {
  label: string;
  value: string;
  /** Renders the value as chips instead of plain text. */
  chips?: string[];
  multiline?: boolean;
}

export function CopyField({ label, value, chips, multiline }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await copyToClipboard(value);
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true);
    }
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 1800);
  }

  const empty = !value.trim();

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 transition hover:border-brand-200">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">
          {label}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          disabled={empty}
          aria-label={`Copy ${label}`}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
            copied
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700',
            empty && 'cursor-not-allowed opacity-40',
          )}
        >
          {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : failed ? 'Press ⌘C' : 'Copy'}
        </button>
      </div>

      {chips ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.length ? (
            chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100"
              >
                {chip}
              </span>
            ))
          ) : (
            <span className="text-sm text-ink-300">Not provided</span>
          )}
        </div>
      ) : (
        <p
          className={cn(
            'mt-1.5 text-sm leading-relaxed break-words',
            multiline ? 'whitespace-pre-wrap' : '',
            empty ? 'text-ink-300' : 'text-ink-800',
          )}
        >
          {empty ? 'Not returned by the workflow' : value}
        </p>
      )}
    </div>
  );
}

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/** Compact standalone copy control for snippets and one-off values. */
export function CopyButton({ value, label = 'Copy', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await copyToClipboard(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
        copied ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-ink-200 hover:bg-white/20',
        className,
      )}
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}
