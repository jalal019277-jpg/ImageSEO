import { GaugeIcon, ImageIcon, TagIcon } from '@/components/Icons';

const HIGHLIGHTS = [
  {
    icon: <GaugeIcon className="h-4 w-4" />,
    title: 'Real compression',
    copy: 'sharp resizes and re-encodes to WEBP, JPG or PNG in one pass.',
  },
  {
    icon: <TagIcon className="h-4 w-4" />,
    title: 'Metadata in the file',
    copy: 'Title, Tags, Authors, Comments and Copyright written into the binary.',
  },
  {
    icon: <ImageIcon className="h-4 w-4" />,
    title: 'Nothing leaves',
    copy: 'No external service, no API keys, no storage — it all runs here.',
  },
];

export function Hero() {
  return (
    <header className="flex flex-col items-center text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-brand-700 shadow-sm backdrop-blur">
        <TagIcon className="h-3.5 w-3.5" />
        Local image optimization + embedded metadata
      </span>

      <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
        Compress an image and{' '}
        <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
          write your SEO into it
        </span>
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-500 sm:text-lg">
        Upload a file, fill in the metadata, and download a smaller image that carries your title,
        tags, description and copyright — visible in Windows Properties, not just in your CMS.
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
