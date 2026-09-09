'use client';

import type { ReactNode, TextareaHTMLAttributes, InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

function FieldShell({ id, label, hint, error, optional, children, className }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-sm font-medium text-ink-800">
        {label}
        {optional ? <span className="text-xs font-normal text-ink-400">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function TextField({
  id,
  label,
  hint,
  error,
  optional,
  icon,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
    >
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hint || error ? `${id}-help` : undefined}
          className={cn('field-input', icon && 'pl-10')}
          {...inputProps}
        />
      </div>
    </FieldShell>
  );
}

interface TextAreaFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  className?: string;
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  optional,
  className,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
    >
      <textarea
        id={id}
        aria-invalid={error ? 'true' : undefined}
        className="field-input min-h-28 resize-y leading-relaxed"
        {...textareaProps}
      />
    </FieldShell>
  );
}

export function SectionHeading({
  icon,
  title,
  description,
  step,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  step: number;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-500">
          Step {step}
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-ink-900">{title}</h2>
        <p className="mt-0.5 text-sm text-ink-500">{description}</p>
      </div>
    </div>
  );
}
