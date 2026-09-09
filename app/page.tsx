'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { BiomechPanel } from '@/components/BiomechBrand';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { IntegrationSection } from '@/components/IntegrationSection';
import { ImageSeoForm, INITIAL_FORM_VALUES } from '@/components/ImageSeoForm';
import { ProcessingState } from '@/components/ProcessingState';
import { ResultsPanel } from '@/components/ResultsPanel';
import { SiteHeader } from '@/components/SiteHeader';
import { ImageSeoRequestError, optimizeImage } from '@/services/imageSeoService';
import type { ImageSeoFormValues, OptimizeResult } from '@/types';

type Status = 'idle' | 'processing' | 'success' | 'error';

interface ErrorState {
  message: string;
  details?: string;
}

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [values, setValues] = useState<ImageSeoFormValues>(INITIAL_FORM_VALUES);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement | null>(null);

  // The "before" preview is the local file, so it never needs a round trip.
  useEffect(() => {
    if (!file) {
      setOriginalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const scrollToOutput = useCallback(() => {
    window.requestAnimationFrame(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;

    setStatus('processing');
    setError(null);
    setResult(null);
    scrollToOutput();

    try {
      const data = await optimizeImage(file, values);
      setResult(data);
      setStatus('success');
      scrollToOutput();
    } catch (caught) {
      setError({
        message: caught instanceof ImageSeoRequestError ? caught.message : 'The optimization failed.',
        details: caught instanceof ImageSeoRequestError ? caught.details : undefined,
      });
      setStatus('error');
    }
  }, [file, scrollToOutput, values]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setStatus('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
      <SiteHeader />
      <Hero />

      <div className="mt-12 sm:mt-14">
        <ImageSeoForm
          file={file}
          onFileChange={setFile}
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          isSubmitting={status === 'processing'}
        />
      </div>

      <div ref={outputRef} className="mt-8 flex scroll-mt-8 flex-col gap-6">
        {status === 'error' && error ? (
          <ErrorBanner
            message={error.message}
            details={error.details}
            onRetry={() => {
              setError(null);
              setStatus('idle');
            }}
          />
        ) : null}

        {status === 'processing' ? <ProcessingState /> : null}

        {status === 'success' && result ? (
          <ResultsPanel
            result={result}
            originalPreviewUrl={originalPreviewUrl}
            onReset={handleReset}
          />
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <IntegrationSection />
        <BiomechPanel />
      </div>

      <Footer />
    </main>
  );
}
