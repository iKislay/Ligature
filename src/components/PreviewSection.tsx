'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { themes } from '@/lib/themes';
import { useWidgetPreview, WidgetPreviewType } from '@/hooks/use-widget-preview';
import { InlineSvg } from '@/components/inline-svg';

type PreviewTab = 'github' | '3d-contrib' | 'games' | 'istime' | 'discord' | 'forg';

const previewOptions = [
  { value: 'github' as PreviewTab, label: 'GitHub Stats' },
  { value: '3d-contrib' as PreviewTab, label: '3D Contributions' },
  { value: 'games' as PreviewTab, label: 'Arcade Games' },
  { value: 'istime' as PreviewTab, label: 'IsTime' },
  { value: 'discord' as PreviewTab, label: 'Discord' },
  { value: 'forg' as PreviewTab, label: 'Forg' },
];

const gameOptions = [
  { value: 'pacman', label: 'Pac-Man' },
  { value: 'bomberman', label: 'Bomberman' },
  { value: 'breakout', label: 'Breakout' },
  { value: 'galaga', label: 'Galaga' },
  { value: 'puzzle-bobble', label: 'Puzzle Bobble' },
  { value: 'minesweeper', label: 'Minesweeper' },
] as const;

const themeKeys = Object.keys(themes);

function tabToWidgetType(
  tab: string,
  game: string,
): WidgetPreviewType | null {
  switch (tab) {
    case 'github':
      return 'github-stats';
    case '3d-contrib':
      return 'isometric';
    case 'games':
      return game as WidgetPreviewType;
    default:
      return null;
  }
}

export function PreviewSection() {
  const [selectedTab, setSelectedTab] = useState<PreviewTab>('github');
  const [imgError, setImgError] = useState(false);
  const { resolvedTheme } = useTheme();

  const {
    username,
    setUsername,
    theme,
    setTheme,
    mode,
    setMode,
    selectedGame,
    setSelectedGame,
    copied,
    getPreviewUrl,
    getMarkdownSnippet,
    handleCopy,
  } = useWidgetPreview();

  const isGame = selectedTab === 'games';
  const widgetType = tabToWidgetType(selectedTab, selectedGame);
  const resolvedMode = mode === 'auto' ? (resolvedTheme as 'light' | 'dark' ?? 'dark') : mode;
  const imageUrl = widgetType ? getPreviewUrl(widgetType, resolvedMode) : '';
  const markdownSnippet = widgetType ? getMarkdownSnippet(widgetType) : '';

  const onCopy = () => handleCopy(markdownSnippet);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12" id="customizer">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {previewOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => { setSelectedTab(option.value); setImgError(false); }}
                className={`h-9 px-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-neutral-300 ${
                  selectedTab === option.value
                    ? 'bg-neutral-100 text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-50'
                    : 'hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="hidden h-4 w-px bg-neutral-200 md:block dark:bg-neutral-800" />

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setImgError(false); }}
              placeholder="Username"
              className="h-9 w-32 rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:focus:ring-neutral-300 md:w-40"
            />
            {isGame ? (
              <select
                value={selectedGame}
                onChange={(e) => { setSelectedGame(e.target.value); setImgError(false); }}
                className="h-9 appearance-none rounded-md border border-neutral-200 bg-transparent px-3 text-sm capitalize focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:focus:ring-neutral-300"
              >
                {gameOptions.map((g) => (
                  <option key={g.value} value={g.value} className="bg-white dark:bg-neutral-900">
                    {g.label}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <select
                  value={theme}
                  onChange={(e) => { setTheme(e.target.value); setImgError(false); }}
                  className="h-9 appearance-none rounded-md border border-neutral-200 bg-transparent px-3 text-sm capitalize focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:focus:ring-neutral-300"
                >
                  {themeKeys.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-neutral-900">
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={mode}
                  onChange={(e) => { setMode(e.target.value as 'light' | 'dark' | 'auto'); setImgError(false); }}
                  className="h-9 appearance-none rounded-md border border-neutral-200 bg-transparent px-3 text-sm capitalize focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:focus:ring-neutral-300"
                >
                  <option value="auto" className="bg-white dark:bg-neutral-900">auto</option>
                  <option value="light" className="bg-white dark:bg-neutral-900">light</option>
                  <option value="dark" className="bg-white dark:bg-neutral-900">dark</option>
                </select>
              </>
            )}
            <button
              onClick={onCopy}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-transparent text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
              title="Copy Markdown Snippet"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Link
          href="#docs"
          className="text-sm font-medium underline underline-offset-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
        >
          View documentation
        </Link>
      </div>

      <div className="flex min-h-[400px] w-full items-center justify-center rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-black md:p-12">
        {widgetType ? (
          imgError ? (
            <div className="flex flex-col items-center space-y-3 text-center">
              <h3 className="text-xl font-semibold tracking-tight">Preview unavailable</h3>
              <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                Could not load the preview. Check the username and try again.
              </p>
            </div>
          ) : (
            <InlineSvg
              key={`${username}-${theme}-${resolvedMode}-${selectedTab}-${selectedGame}`}
              src={imageUrl}
              className="w-full max-w-[800px] [&>svg]:w-full [&>svg]:h-auto"
              fallback={
                <div className="flex flex-col items-center space-y-3 text-center">
                  <h3 className="text-xl font-semibold tracking-tight">Preview unavailable</h3>
                  <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                    Could not load the preview. Check the username and try again.
                  </p>
                </div>
              }
            />
          )
        ) : (
          <div className="flex flex-col items-center space-y-3 text-center">
            <h3 className="text-xl font-semibold tracking-tight">Coming Soon</h3>
            <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
              The {selectedTab} widget is currently in development and will be available in Phase 2.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
