'use client';

import { SparklesIcon } from '@/components/Icons';
import { cn } from '@/lib/utils';

interface AiToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * When switched off the request carries `use_ai_analysis: false`, so the n8n
 * workflow skips the vision step and writes metadata from the brand fields only.
 */
export function AiToggle({ checked, onChange, disabled }: AiToggleProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-xl border p-4 transition sm:items-center',
        checked ? 'border-brand-200 bg-brand-50/60' : 'border-ink-200 bg-white',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition sm:mt-0',
          checked ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400',
        )}
      >
        <SparklesIcon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-900">Enable AI Image Analysis</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
          Let the AI look at the image itself to describe what is in it. Turn this off to generate
          metadata from your brand details alone — faster and cheaper.
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Enable AI Image Analysis"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25',
          checked ? 'bg-brand-600' : 'bg-ink-300',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          className={cn(
            'inline-block transform rounded-full bg-white shadow transition',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
          style={{ height: '1.125rem', width: '1.125rem' }}
        />
      </button>
    </div>
  );
}
