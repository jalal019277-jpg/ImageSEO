'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'image-seo-theme';

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Writes the attribute the CSS reads. Kept in sync with the layout script. */
function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? systemTheme() : theme;
  document.documentElement.dataset.theme = resolved;
}

const OPTIONS: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4a8.3 8.3 0 1 0 10.5 10.5Z" />
      </svg>
    ),
  },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
    setTheme(stored);
    setMounted(true);
  }, []);

  // Follow the OS while the preference is "system".
  useEffect(() => {
    if (!mounted || theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [mounted, theme]);

  function choose(next: Theme) {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing — the choice just will not persist.
    }
    applyTheme(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-surface/80 p-0.5 backdrop-blur"
    >
      {OPTIONS.map((option) => {
        const active = mounted && theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => choose(option.value)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full transition',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25',
              active ? 'bg-accent text-white' : 'text-fg-subtle hover:text-fg',
            )}
          >
            <span className="h-3.5 w-3.5">{option.icon}</span>
          </button>
        );
      })}
    </div>
  );
}
