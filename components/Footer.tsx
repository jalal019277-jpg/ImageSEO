import { BIOMECH_URL, BiomechMark } from '@/components/BiomechBrand';

export function Footer() {
  return (
    <footer className="mt-16 flex flex-col items-center gap-3 border-t border-line pt-6 text-center">
      <a
        href={BIOMECH_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex flex-wrap items-center justify-center gap-2 text-sm text-fg-muted transition hover:text-fg"
      >
        <BiomechMark className="h-5 w-5 text-accent" />
        <span>
          Powered by <span className="font-semibold text-fg">Biomech Studio</span>
        </span>
        <span className="text-fg-subtle transition group-hover:text-accent">biomechstudio.com</span>
      </a>

      <p className="text-xs text-fg-subtle">
        Images are processed in memory on the server and never stored.
      </p>
    </footer>
  );
}
