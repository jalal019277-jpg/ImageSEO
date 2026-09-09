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
      className="animate-rise rounded-2xl border border-red-200 bg-red-50/80 p-5 backdrop-blur"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-red-600">
          <AlertIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-800">{message}</p>
          {details ? (
            <p className="mt-1 break-words text-xs leading-relaxed text-red-700/80">{details}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"
        >
          <RefreshIcon className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    </div>
  );
}
