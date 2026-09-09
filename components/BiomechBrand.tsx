import { ArrowRightIcon } from '@/components/Icons';

export const BIOMECH_URL = 'https://www.biomechstudio.com';

/** The mark used in the header and footer. */
export function BiomechMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="currentColor" opacity="0.12" />
      <path
        d="M7.5 16.5V7.5h4a2.5 2.5 0 0 1 0 5h-4m0 0h4.4a2.5 2.5 0 0 1 0 5H7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16.6" cy="8.4" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Compact "Powered by" pill for the header. */
export function BiomechBadge() {
  return (
    <a
      href={BIOMECH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs font-medium text-fg-muted backdrop-blur transition hover:border-accent hover:text-fg"
    >
      <BiomechMark className="h-4 w-4 text-accent" />
      <span>
        Powered by <span className="font-semibold text-fg">Biomech Studio</span>
      </span>
    </a>
  );
}

/**
 * Marketing panel near the foot of the page.
 *
 * The copy here is deliberately generic — swap it for Biomech Studio's own
 * positioning and services rather than shipping placeholder wording.
 */
export function BiomechPanel() {
  return (
    <section className="card animate-rise overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-fg ring-1 ring-accent-line">
            <BiomechMark className="h-3.5 w-3.5" />
            Biomech Studio
          </span>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-fg">
            This tool was built by Biomech Studio
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
            We build web tools and automation that take the manual work out of publishing — from
            image pipelines like this one to full workflow integrations. If you need something
            similar for your own stack, we would like to hear about it.
          </p>
        </div>

        <a
          href={BIOMECH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-fg px-6 py-3.5 text-sm font-semibold text-surface transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
        >
          Visit biomechstudio.com
          <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
}
