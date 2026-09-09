import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'AI Image SEO Optimizer — compress images and embed SEO metadata',
  description:
    'Upload an image, add your metadata, and download a compressed file that carries the title, tags, description and copyright inside it — visible in Windows Properties. Built by Biomech Studio.',
  keywords: [
    'image SEO',
    'EXIF metadata',
    'IPTC',
    'image compression',
    'WebP converter',
    'n8n image optimizer',
  ],
  openGraph: {
    title: 'AI Image SEO Optimizer',
    description:
      'Compress any image and write your SEO metadata into the file itself. Built by Biomech Studio.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0e1c' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * Applies the stored theme before first paint. Without this the page would
 * flash the light palette on every load for dark-mode users.
 */
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('image-seo-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='light'||s==='dark')?s:(d?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="page-backdrop min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
