'use client';

import { useState, useCallback } from 'react';
import { siteConfig } from '@/config/site';

export type WidgetPreviewType =
  | 'github-stats'
  | 'isometric'
  | 'pacman'
  | 'breakout'
  | 'galaga'
  | 'bomberman'
  | 'puzzle-bobble'
  | 'minesweeper'
  | 'trends'
  | 'actions'
  | 'github-profile'
  | 'star-history';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface UseWidgetPreviewOptions {
  defaultUsername?: string;
  defaultTheme?: string;
  defaultMode?: ThemeMode;
  defaultGame?: string;
}

export function useWidgetPreview(options?: UseWidgetPreviewOptions) {
  const [username, setUsername] = useState(options?.defaultUsername ?? 'iKislay');
  const [theme, setTheme] = useState(options?.defaultTheme ?? 'geist');
  const [mode, setMode] = useState<ThemeMode>(options?.defaultMode ?? 'auto');
  const [selectedGame, setSelectedGame] = useState(options?.defaultGame ?? 'pacman');
  const [copied, setCopied] = useState(false);

  const getPreviewUrl = useCallback(
    (type: WidgetPreviewType, resolvedMode?: 'light' | 'dark'): string => {
      const user = username || 'iKislay';
      const repo = user.includes('/') ? user : `${user}/Ligature`;
      const modeValue = resolvedMode ?? (mode === 'auto' ? 'dark' : mode);

      switch (type) {
        case 'github-stats':
          return `/api/github?user=${user}&theme=${theme}&mode=${modeValue}`;
        case 'star-history':
          return `/api/star-history?repo=${repo}&theme=${theme}&mode=${modeValue}`;
        case 'github-profile':
          return `/api/github/profile?user=${user}&theme=${theme}&mode=${modeValue}`;
        case 'isometric':
          return `/api/isometric?user=${user}&theme=${theme}&mode=${modeValue}`;
        case 'pacman':
        case 'breakout':
        case 'galaga':
        case 'bomberman':
        case 'puzzle-bobble':
        case 'minesweeper':
          return `/api/games?user=${user}&game=${type}&theme=${theme}&mode=${modeValue}`;

        default:
          return `/api/github?user=${user}&theme=${theme}&mode=${modeValue}`;
      }
    },
    [username, theme, mode]
  );

  const getFullPreviewUrl = useCallback(
    (type: WidgetPreviewType, resolvedMode?: 'light' | 'dark'): string => {
      const url = getPreviewUrl(type, resolvedMode);
      if (url.startsWith('http')) return url;
      return `${siteConfig.url}${url}`;
    },
    [getPreviewUrl]
  );

  const getMarkdownSnippet = useCallback(
    (type: WidgetPreviewType): string => {
      const user = username || 'iKislay';
      const repo = user.includes('/') ? user : `${user}/Ligature`;
      const fullUrl = getFullPreviewUrl(type);

      let label: string;
      switch (type) {
        case 'github-stats':
          label = 'GitHub Stats';
          break;
        case 'star-history':
          label = 'Star History';
          break;
        case 'github-profile':
          label = 'GitHub Profile Overview';
          break;
        case 'isometric':
          label = '3D Contribution Graph';
          break;
        case 'pacman':
        case 'breakout':
        case 'galaga':
        case 'bomberman':
        case 'puzzle-bobble':
        case 'minesweeper':
          label = `${type.charAt(0).toUpperCase() + type.slice(1)} Game`;
          break;
        default:
          label = 'Widget';
      }

      const targetUrl = type === 'star-history' ? `https://github.com/${repo}` : `https://github.com/${user}`;
      return `[![${type === 'star-history' ? repo : user}'s ${label}](${fullUrl})](${targetUrl})`;
    },
    [username, getFullPreviewUrl]
  );

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return {
    username,
    setUsername,
    theme,
    setTheme,
    mode,
    setMode,
    selectedGame,
    setSelectedGame,
    copied,
    setCopied,
    getPreviewUrl,
    getFullPreviewUrl,
    getMarkdownSnippet,
    handleCopy,
  };
}
