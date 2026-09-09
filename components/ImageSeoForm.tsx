'use client';

import type { FormEvent } from 'react';

import { FormatSelector } from '@/components/FormatSelector';
import { ImageDropzone } from '@/components/ImageDropzone';
import { SectionHeading, TextAreaField, TextField } from '@/components/Field';
import { ArrowRightIcon, ImageIcon, SettingsIcon, SparklesIcon, TagIcon } from '@/components/Icons';
import { FORMATS_WITH_SUBJECT, type ImageSeoFormValues } from '@/types';

export const INITIAL_FORM_VALUES: ImageSeoFormValues = {
  output_format: 'webp',
  quality: 82,
  max_width: null,
  filename: '',
  title: '',
  alt_text: '',
  subject: '',
  description: '',
  primary_keyword: '',
  secondary_keywords: '',
  author: '',
  copyright: '',
};

interface ImageSeoFormProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  values: ImageSeoFormValues;
  onChange: (values: ImageSeoFormValues) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ImageSeoForm({
  file,
  onFileChange,
  values,
  onChange,
  onSubmit,
  isSubmitting,
}: ImageSeoFormProps) {
  const subjectSupported = FORMATS_WITH_SUBJECT.includes(values.output_format);
  const losslessFormat = values.output_format === 'png';

  function set<K extends keyof ImageSeoFormValues>(key: K, value: ImageSeoFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {/* ---------------------------------------------------------------- */}
      <section className="card p-6 sm:p-7">
        <SectionHeading
          step={1}
          icon={<ImageIcon className="h-5 w-5" />}
          title="Choose an image"
          description="Everything is processed on the server that runs this app — your file is never sent anywhere else."
        />
        <div className="mt-5">
          <ImageDropzone file={file} onSelect={onFileChange} disabled={isSubmitting} />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="card p-6 sm:p-7">
        <SectionHeading
          step={2}
          icon={<TagIcon className="h-5 w-5" />}
          title="SEO metadata"
          description="Written into the image file itself, so Windows Explorer's Details tab shows these exact values."
        />

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            id="title"
            label="Title"
            placeholder="Orthopedic Shoe Last"
            value={values.title}
            onChange={(event) => set('title', event.target.value)}
            hint="Shows as Windows → Title."
            disabled={isSubmitting}
          />
          <TextField
            id="subject"
            label="Subject"
            placeholder="Custom shoe last for medicated insoles"
            value={values.subject}
            onChange={(event) => set('subject', event.target.value)}
            hint={
              subjectSupported
                ? 'Shows as Windows → Subject.'
                : 'Windows only shows Subject for JPG — it will be skipped for this format.'
            }
            disabled={isSubmitting}
            optional
          />
          <TextAreaField
            id="description"
            label="Description"
            placeholder="Precision 3D orthotic shoe last, machined for medicated insole fitting."
            value={values.description}
            onChange={(event) => set('description', event.target.value)}
            hint="Shows as Windows → Comments."
            className="sm:col-span-2"
            disabled={isSubmitting}
          />
          <TextAreaField
            id="alt_text"
            label="Alt text"
            placeholder="Close-up of a custom orthopedic shoe last on a workbench"
            value={values.alt_text}
            onChange={(event) => set('alt_text', event.target.value)}
            hint="For the HTML <img> tag. Image files have no alt field, so this is not embedded."
            className="sm:col-span-2"
            disabled={isSubmitting}
          />
          <TextField
            id="primary_keyword"
            label="Primary keyword"
            placeholder="orthopedic shoe last"
            value={values.primary_keyword}
            onChange={(event) => set('primary_keyword', event.target.value)}
            hint="Leads the Tags list and names the file."
            disabled={isSubmitting}
          />
          <TextField
            id="secondary_keywords"
            label="Secondary keywords"
            placeholder="custom shoe last design, medicated insoles"
            value={values.secondary_keywords}
            onChange={(event) => set('secondary_keywords', event.target.value)}
            hint="Comma separated. Shows as Windows → Tags."
            disabled={isSubmitting}
            optional
          />
          <TextField
            id="author"
            label="Author"
            placeholder="Acme Footwear"
            value={values.author}
            onChange={(event) => set('author', event.target.value)}
            hint="Shows as Windows → Authors."
            disabled={isSubmitting}
            optional
          />
          <TextField
            id="copyright"
            label="Copyright"
            placeholder="© 2026 Acme Footwear"
            value={values.copyright}
            onChange={(event) => set('copyright', event.target.value)}
            hint="Shows as Windows → Copyright."
            disabled={isSubmitting}
            optional
          />
          <TextField
            id="filename"
            label="Filename"
            placeholder="orthopedic-shoe-last"
            value={values.filename}
            onChange={(event) => set('filename', event.target.value)}
            hint="Leave empty to build one from the primary keyword. The extension is added for you."
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
          description="Pick the format and how hard to compress."
        />

        <div className="mt-5 flex flex-col gap-6">
          <FormatSelector
            value={values.output_format}
            onChange={(format) => set('output_format', format)}
            disabled={isSubmitting}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="quality" className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-ink-800">Quality</span>
                <span className="text-sm font-semibold tabular-nums text-brand-700">
                  {losslessFormat ? 'lossless' : values.quality}
                </span>
              </label>
              <input
                id="quality"
                type="range"
                min={40}
                max={100}
                step={1}
                value={values.quality}
                onChange={(event) => set('quality', Number(event.target.value))}
                disabled={isSubmitting || losslessFormat}
                className="mt-3 w-full accent-brand-600 disabled:opacity-40"
              />
              <p className="mt-1.5 text-xs text-ink-500">
                {losslessFormat
                  ? 'PNG is lossless, so quality does not apply.'
                  : '82 is a good balance. Below 60 starts to show.'}
              </p>
            </div>

            <TextField
              id="max_width"
              label="Max width"
              type="number"
              inputMode="numeric"
              min={16}
              placeholder="1600"
              value={values.max_width ?? ''}
              onChange={(event) =>
                set('max_width', event.target.value ? Number(event.target.value) : null)
              }
              hint="Pixels. Leave empty to keep the original size. Images are never enlarged."
              disabled={isSubmitting}
              optional
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <div className="sticky bottom-4 z-10">
        <button
          type="submit"
          disabled={isSubmitting || !file}
          className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-ink-900 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-18px_rgba(20,25,54,0.9)] transition hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SparklesIcon className="h-5 w-5 text-brand-200" />
          {isSubmitting ? 'Optimizing…' : !file ? 'Choose an image to continue' : 'Optimize & embed metadata'}
          {!isSubmitting && file ? (
            <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
          ) : null}
        </button>
      </div>
    </form>
  );
}
