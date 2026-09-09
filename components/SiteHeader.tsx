import { BiomechBadge } from '@/components/BiomechBrand';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TagIcon } from '@/components/Icons';

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-8 border-b border-line/70 bg-page/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <TagIcon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-fg">Image SEO Optimizer</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#api"
            className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-fg-muted transition hover:text-fg sm:inline-block"
          >
            n8n API
          </a>
          <div className="hidden sm:block">
            <BiomechBadge />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
