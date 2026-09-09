import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'AI Image SEO Optimizer — compress images and generate SEO metadata',
  description:
    'Paste an image URL, add your brand context, and get a compressed image plus AI-generated filename, alt text, title, caption and description built for search.',
  keywords: [
    'image SEO',
    'alt text generator',
    'image compression',
    'WebP converter',
    'AI SEO metadata',
  ],
  openGraph: {
    title: 'AI Image SEO Optimizer',
    description:
      'Compress any image and generate brand-aware SEO metadata: filename, alt text, title, caption and description.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="page-backdrop min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
