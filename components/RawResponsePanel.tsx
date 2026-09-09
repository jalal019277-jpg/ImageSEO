'use client';

import { CopyButton } from '@/components/CopyField';
import { CodeIcon } from '@/components/Icons';

interface RawResponsePanelProps {
  raw: unknown;
  /** Metadata fields the workflow left empty, if any. */
  missing: string[];
}

/**
 * Shows exactly what n8n sent back. When the workflow returns nothing usable
 * for a field the UI falls back to the submitted brand details, which makes it
 * easy to mistake a fallback for a generated value — this panel removes that
 * ambiguity while a workflow is being built.
 */
export function RawResponsePanel({ raw, missing }: RawResponsePanelProps) {
  const json = (() => {
    try {
      return JSON.stringify(raw, null, 2);
    } catch {
      return String(raw);
    }
  })();

  return (
    <section className="card animate-rise overflow-hidden p-6 sm:p-7">
      {missing.length > 0 ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm font-semibold text-amber-900">
            The workflow did not return {missing.length} field
            {missing.length === 1 ? '' : 's'}: {missing.join(', ')}.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800/90">
            Anything shown above that the workflow omitted was filled in from the brand details you
            submitted — it is not AI-generated. Check the raw response below: if your AI node returns
            its JSON as text, make sure the workflow parses it before the Respond node.
          </p>
        </div>
      ) : null}

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-1 text-sm font-medium text-ink-700 transition hover:text-brand-700">
          <span className="flex items-center gap-2">
            <CodeIcon className="h-4 w-4" />
            Raw workflow response
          </span>
          <span className="text-xs text-ink-400 group-open:hidden">Show</span>
          <span className="hidden text-xs text-ink-400 group-open:inline">Hide</span>
        </summary>

        <div className="mt-4 rounded-xl border border-ink-200 bg-ink-900 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-300">
              Exactly what n8n sent
            </p>
            <CopyButton value={json} label="Copy JSON" />
          </div>
          <pre className="mt-2 max-h-96 overflow-auto text-xs leading-relaxed text-brand-100">
            <code>{json}</code>
          </pre>
        </div>
      </details>
    </section>
  );
}
