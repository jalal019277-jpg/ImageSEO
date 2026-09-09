'use client';

import { useMemo, useState, type FormEvent } from 'react';

import { AiToggle } from '@/components/AiToggle';
import { FormatSelector } from '@/components/FormatSelector';
import { SectionHeading, TextAreaField, TextField } from '@/components/Field';
import {
  ArrowRightIcon,
  BuildingIcon,
  ImageIcon,
  LinkIcon,
  SettingsIcon,
  SparklesIcon,
} from '@/components/Icons';
import { validateImageUrl } from '@/lib/utils';
import type { ImageSeoFormValues } from '@/types';

export const INITIAL_FORM_VALUES: ImageSeoFormValues = {
  image_url: '',
  output_format: 'webp',
  use_ai_analysis: true,
  company_name: '',
  industry: '',
  target_audience: '',
  target_market: '',
  primary_keyword: '',
  secondary_keywords: '',
  brand_description: '',
};

interface ImageSeoFormProps {
  values: ImageSeoFormValues;
  onChange: (values: ImageSeoFormValues) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ImageSeoForm({ values, onChange, onSubmit, isSubmitting }: ImageSeoFormProps) {
  const [touchedUrl, setTouchedUrl] = useState(false);

  const urlError = useMemo(() => validateImageUrl(values.image_url), [values.image_url]);
  const showUrlError = touchedUrl && urlError ? urlError : null;

  function set<K extends keyof ImageSeoFormValues>(key: K, value: ImageSeoFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouchedUrl(true);
    if (urlError) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {/* ---------------------------------------------------------------- */}
      <section className="card p-6 sm:p-7">
        <SectionHeading
          step={1}
          icon={<ImageIcon className="h-5 w-5" />}
          title="Image source"
          description="Paste a public link to the image you want to optimize."
        />

        <div className="mt-5">
          <TextField
            id="image_url"
            label="Image URL"
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            placeholder="https://cdn.yoursite.com/photos/product-shot.jpg"
            value={values.image_url}
            onChange={(event) => set('image_url', event.target.value)}
            onBlur={() => setTouchedUrl(true)}
            error={showUrlError}
            hint="Must be publicly reachable — JPG, PNG, WEBP, GIF or AVIF."
            icon={<LinkIcon className="h-4 w-4" />}
            disabled={isSubmitting}
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="card p-6 sm:p-7">
        <SectionHeading
          step={2}
          icon={<BuildingIcon className="h-5 w-5" />}
          title="Brand & company information"
          description="Context the AI uses to write metadata that sounds like you and ranks for your terms."
        />

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            id="company_name"
            label="Company name"
            placeholder="Northwind Coffee Roasters"
            value={values.company_name}
            onChange={(event) => set('company_name', event.target.value)}
            disabled={isSubmitting}
            optional
          />
          <TextField
            id="industry"
            label="Industry"
            placeholder="Specialty coffee & e-commerce"
            value={values.industry}
            onChange={(event) => set('industry', event.target.value)}
            disabled={isSubmitting}
            optional
          />
          <TextField
            id="target_audience"
            label="Target audience"
            placeholder="Home baristas aged 25–45"
            value={values.target_audience}
            onChange={(event) => set('target_audience', event.target.value)}
            disabled={isSubmitting}
            optional
          />
          <TextField
            id="target_market"
            label="Target market"
            placeholder="United Kingdom & Ireland"
            value={values.target_market}
            onChange={(event) => set('target_market', event.target.value)}
            disabled={isSubmitting}
            optional
          />
          <TextField
            id="primary_keyword"
            label="Primary keyword"
            placeholder="single origin coffee beans"
            value={values.primary_keyword}
            onChange={(event) => set('primary_keyword', event.target.value)}
            hint="The one term this image should rank for."
            disabled={isSubmitting}
            optional
          />
          <TextField
            id="secondary_keywords"
            label="Secondary keywords"
            placeholder="ethiopian roast, pour over beans, fresh ground"
            value={values.secondary_keywords}
            onChange={(event) => set('secondary_keywords', event.target.value)}
            hint="Separate with commas."
            disabled={isSubmitting}
            optional
          />
          <TextAreaField
            id="brand_description"
            label="Brand description"
            placeholder="We roast small-batch, single-origin beans and ship them within 48 hours of roasting. Warm, expert, never pretentious."
            value={values.brand_description}
            onChange={(event) => set('brand_description', event.target.value)}
            hint="Tone of voice, positioning, anything the copy should reflect."
            className="sm:col-span-2"
            disabled={isSubmitting}
            optional
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="card p-6 sm:p-7">
        <SectionHeading
          step={3}
          icon={<SettingsIcon className="h-5 w-5" />}
          title="Output settings"
          description="Choose the delivery format and whether the AI inspects the image itself."
        />

        <div className="mt-5 flex flex-col gap-5">
          <FormatSelector
            value={values.output_format}
            onChange={(format) => set('output_format', format)}
            disabled={isSubmitting}
          />
          <AiToggle
            checked={values.use_ai_analysis}
            onChange={(checked) => set('use_ai_analysis', checked)}
            disabled={isSubmitting}
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <div className="sticky bottom-4 z-10">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-ink-900 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-18px_rgba(20,25,54,0.9)] transition hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SparklesIcon className="h-5 w-5 text-brand-200" />
          {isSubmitting ? 'Optimizing…' : 'Optimize image & generate SEO'}
          {!isSubmitting ? (
            <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
          ) : null}
        </button>
      </div>
    </form>
  );
}
