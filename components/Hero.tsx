import { GaugeIcon, ImageIcon, SparklesIcon } from '@/components/Icons';

const HIGHLIGHTS = [
  {
    icon: <GaugeIcon className="h-4 w-4" />,
    title: 'Smaller files',
    copy: 'Compress and convert to WEBP, PNG or JPG in one pass.',
  },
  {
    icon: <SparklesIcon className="h-4 w-4" />,
    title: 'Brand-aware copy',
    copy: 'Alt text and descriptions written in your voice, for your market.',
  },
  {
    icon: <ImageIcon className="h-4 w-4" />,
    title: 'Ready to ship',
    copy: 'SEO filename, metadata JSON export and a paste-ready <img> tag.',
  },
];

export function Hero() {
  return (
    <header className="flex flex-col items-center text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-brand-700 shadow-sm backdrop-blur">
        <SparklesIcon className="h-3.5 w-3.5" />
        AI image optimization + on-page SEO
      </span>

      <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
        Turn any image into a{' '}
        <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
          search-ready asset
        </span>
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg">
        Paste an image URL, tell us about your brand, and get a compressed file plus the filename,
        alt text, title, caption and description that help it rank.
      </p>

      <ul className="mt-8 grid w-full gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => (
          <li
            key={item.title}
            className="flex flex-col items-start gap-1.5 rounded-xl border border-ink-200/80 bg-white/70 p-4 text-left backdrop-blur"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              {item.icon}
            </span>
            <p className="text-sm font-semibold text-ink-900">{item.title}</p>
            <p className="text-xs leading-relaxed text-ink-500">{item.copy}</p>
          </li>
        ))}
      </ul>
    </header>
  );
}
