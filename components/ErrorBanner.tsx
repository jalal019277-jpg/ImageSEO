'use client';

import { AlertIcon, RefreshIcon } from '@/components/Icons';

interface ErrorBannerProps {
  message: string;
  details?: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, details, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="animate-rise rounded-2xl border border-danger-line bg-danger-soft/80 p-5 backdrop-blur"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-danger-fg">
          <AlertIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-danger-fg">{message}</p>
          {details ? (
            <p className="mt-1 break-words text-xs leading-relaxed text-danger-fg/80">{details}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-danger-line bg-surface px-3 py-1.5 text-xs font-semibold text-danger-fg transition hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger-fg/20"
        >
          <RefreshIcon className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    </div>
  );
}
