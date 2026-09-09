'use client';

import { useCallback, useRef, useState } from 'react';

import { ErrorBanner } from '@/components/ErrorBanner';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { ImageSeoForm, INITIAL_FORM_VALUES } from '@/components/ImageSeoForm';
import { ProcessingState } from '@/components/ProcessingState';
import { ResultsPanel } from '@/components/ResultsPanel';
import { ImageSeoRequestError, optimizeImage } from '@/services/imageSeoService';
import type { ImageSeoFormValues, ImageSeoResult } from '@/types';

type Status = 'idle' | 'processing' | 'success' | 'error';

interface ErrorState {
  message: string;
  details?: string;
}

export default function HomePage() {
  const [values, setValues] = useState<ImageSeoFormValues>(INITIAL_FORM_VALUES);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ImageSeoResult | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);

  const outputRef = useRef<HTMLDivElement | null>(null);

  const scrollToOutput = useCallback(() => {
    // Wait for the panel to mount before scrolling to it.
    window.requestAnimationFrame(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setStatus('processing');
    setError(null);
    setResult(null);
    scrollToOutput();

    try {
      const data = await optimizeImage(values);
      setResult(data);
      setStatus('success');
      scrollToOutput();
    } catch (caught) {
      setError({
        message:
          caught instanceof ImageSeoRequestError
            ? caught.message
            : 'The optimization request failed.',
        details: caught instanceof ImageSeoRequestError ? caught.details : undefined,
      });
      setStatus('error');
    }
  }, [scrollToOutput, values]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setStatus('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <Hero />

      <div className="mt-12 sm:mt-14">
        <ImageSeoForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          isSubmitting={status === 'processing'}
        />
      </div>

      <div ref={outputRef} className="mt-8 scroll-mt-8 flex flex-col gap-6">
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

        {status === 'processing' ? <ProcessingState useAiAnalysis={values.use_ai_analysis} /> : null}

        {status === 'success' && result ? (
          <ResultsPanel result={result} onReset={handleReset} />
        ) : null}
      </div>

      <Footer />
    </main>
  );
}
