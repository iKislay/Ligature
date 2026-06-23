'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { WidgetPreviewType, useWidgetPreview } from '@/hooks/use-widget-preview';
import { InlineSvg } from '@/components/inline-svg';

const THEME_OPTIONS = ['geist', 'cyberpunk', 'minimal', 'retro'] as const;
const MODE_OPTIONS = ['auto', 'light', 'dark'] as const;

const WIDGET_LABELS: Record<WidgetPreviewType, string> = {
  'github-stats': 'GitHub Stats',
  'github-profile': 'GitHub Profile Overview',
  isometric: '3D Contribution Graph',
  pacman: 'Pac-Man',
  breakout: 'Breakout',
  galaga: 'Galaga',
  bomberman: 'Bomberman',
  'puzzle-bobble': 'Puzzle Bobble',
  minesweeper: 'Minesweeper',
  trends: 'GitHub Trends',
  actions: 'GitHub Actions',
  'star-history': 'Star History',
};

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-900">
        <p className="text-sm text-neutral-500">
          Failed to load preview. Check the username and try again.
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-full max-w-[800px] rounded-lg shadow-sm"
    />
  );
}

interface WidgetPreviewProps {
  type: WidgetPreviewType;
  requiresAuth?: boolean;
  fallbackImage?: string;
}

export function WidgetPreview({
  type,
}: WidgetPreviewProps) {
  const { resolvedTheme } = useTheme();
  const {
    username,
    setUsername,
    theme,
    setTheme,
    mode,
    setMode,
    copied,
    getPreviewUrl,
    getMarkdownSnippet,
    handleCopy,
  } = useWidgetPreview({
    defaultUsername: type === 'star-history' ? 'iKislay/Ligature' : 'iKislay'
  });

  const resolvedMode = mode === 'auto' ? (resolvedTheme as 'light' | 'dark' ?? 'dark') : mode;
  const relativeUrl = getPreviewUrl(type, resolvedMode);
  const markdownSnippet = getMarkdownSnippet(type);
  const showThemeSelector = type !== 'trends' && type !== 'actions';
  const showModeSelector = type !== 'trends' && type !== 'actions';
  const widgetLabel = WIDGET_LABELS[type] ?? type;
  const useInlineSvg = type === 'github-profile';

  return (
    <div className="my-8 w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
      <div className="flex min-h-[280px] items-center justify-center bg-white p-4 md:p-8 dark:bg-black">
        {useInlineSvg ? (
          <InlineSvg
            key={relativeUrl}
            src={relativeUrl}
            className="w-full max-w-[800px] [&>svg]:w-full [&>svg]:h-auto"
            fallback={
              <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-900">
                <p className="text-sm text-neutral-500">Loading preview...</p>
              </div>
            }
          />
        ) : (
          <PreviewImage src={relativeUrl} alt={`${widgetLabel} preview for ${username}`} />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={type === 'star-history' ? 'owner/repo' : 'GitHub username'}
          className="h-9 w-36 rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:focus:ring-neutral-300 md:w-44"
        />
        {showThemeSelector && (
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="h-9 rounded-md border border-neutral-200 bg-transparent px-3 text-sm capitalize focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:focus:ring-neutral-300"
          >
            {THEME_OPTIONS.map((t) => (
              <option key={t} value={t} className="bg-white dark:bg-neutral-900">
                {t}
              </option>
            ))}
          </select>
        )}
        {showModeSelector && (
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'auto')}
            className="h-9 rounded-md border border-neutral-200 bg-transparent px-3 text-sm capitalize focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:focus:ring-neutral-300"
          >
            {MODE_OPTIONS.map((m) => (
              <option key={m} value={m} className="bg-white dark:bg-neutral-900">
                {m}
              </option>
            ))}
          </select>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-neutral-400 md:block">Copy embed</span>
          <button
            onClick={() => handleCopy(markdownSnippet)}
            className="inline-flex size-8 items-center justify-center rounded-md border border-neutral-200 bg-transparent text-sm transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
            title="Copy Markdown Snippet"
          >
            {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
