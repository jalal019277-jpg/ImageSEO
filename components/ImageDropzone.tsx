'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type DragEvent } from 'react';

import { ImageIcon, RefreshIcon } from '@/components/Icons';
import { MAX_UPLOAD_BYTES } from '@/services/imageSeoService';
import { cn, formatBytes } from '@/lib/utils';

interface ImageDropzoneProps {
  file: File | null;
  onSelect: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageDropzone({ file, onSelect, disabled }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Object URLs must be released or the blobs leak for the page's lifetime.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function accept(candidate: File | undefined) {
    if (!candidate) return;
    if (!candidate.type.startsWith('image/')) {
      setError('That is not an image file.');
      return;
    }
    if (candidate.size > MAX_UPLOAD_BYTES) {
      setError(
        `${formatBytes(candidate.size)} is too large — the limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`,
      );
      return;
    }
    setError(null);
    onSelect(candidate);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    accept(event.dataTransfer.files?.[0]);
  }

  if (file && previewUrl) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-ink-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="checkerboard flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          <img src={previewUrl} alt="Selected image" className="h-full w-full object-contain" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-900">{file.name}</p>
          <p className="mt-0.5 text-xs text-ink-500">
            {formatBytes(file.size)} · {file.type.replace('image/', '').toUpperCase()}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onSelect(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
          disabled={disabled}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-700 transition hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 disabled:opacity-60"
        >
          <RefreshIcon className="h-3.5 w-3.5" />
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'rounded-xl border-2 border-dashed p-8 text-center transition',
          dragging ? 'border-brand-500 bg-brand-50/70' : 'border-ink-200 bg-white hover:border-brand-300',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <ImageIcon className="h-6 w-6" />
        </span>

        <p className="mt-3 text-sm font-medium text-ink-900">Drop an image here</p>
        <p className="mt-1 text-xs text-ink-500">
          JPG, PNG, WEBP, GIF, AVIF or TIFF · up to {formatBytes(MAX_UPLOAD_BYTES)}
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="mt-4 inline-flex items-center rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 disabled:cursor-not-allowed"
        >
          Browse files
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => accept(event.target.files?.[0])}
          disabled={disabled}
        />
      </div>

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
