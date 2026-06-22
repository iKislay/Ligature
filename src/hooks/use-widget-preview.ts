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
  | 'skyline'
  | 'trends'
  | 'actions'
  | 'github-profile'
  | 'summary-stats'
  | 'summary-profile'
  | 'summary-repos-lang'
  | 'summary-commit-lang'
  | 'summary-productive';

export interface UseWidgetPreviewOptions {
  defaultUsername?: string;
  defaultTheme?: string;
  defaultGame?: string;
}

export function useWidgetPreview(options?: UseWidgetPreviewOptions) {
  const [username, setUsername] = useState(options?.defaultUsername ?? 'iKislay');
  const [theme, setTheme] = useState(options?.defaultTheme ?? 'geist');
  const [selectedGame, setSelectedGame] = useState(options?.defaultGame ?? 'pacman');
  const [copied, setCopied] = useState(false);

  const getPreviewUrl = useCallback(
    (type: WidgetPreviewType): string => {
      const user = username || 'iKislay';

      switch (type) {
        case 'github-stats':
          return `/api/github?user=${user}&theme=${theme}`;
        case 'github-profile':
          return `/api/github/profile?user=${user}&theme=${theme}`;
        case 'isometric':
          return `/api/isometric?user=${user}&theme=${theme}`;
        case 'skyline':
          return `https://github.com/user-attachments/assets/ed0fe34e-6825-4eb2-91d7-a0834966dc3a`;
        case 'pacman':
        case 'breakout':
        case 'galaga':
        case 'bomberman':
        case 'puzzle-bobble':
        case 'minesweeper':
          return `/api/games?user=${user}&game=${type}`;
        case 'summary-stats':
          return `/api/github-summary?user=${user}&theme=${theme}&card=stats`;
        case 'summary-profile':
          return `/api/github-summary?user=${user}&theme=${theme}&card=profile-details`;
        case 'summary-repos-lang':
          return `/api/github-summary?user=${user}&theme=${theme}&card=repos-per-language`;
        case 'summary-commit-lang':
          return `/api/github-summary?user=${user}&theme=${theme}&card=most-commit-language`;
        case 'summary-productive':
          return `/api/github-summary?user=${user}&theme=${theme}&card=productive-time`;
        default:
          return `/api/github?user=${user}&theme=${theme}`;
      }
    },
    [username, theme]
  );

  const getFullPreviewUrl = useCallback(
    (type: WidgetPreviewType): string => {
      const url = getPreviewUrl(type);
      if (url.startsWith('http')) return url;
      return `${siteConfig.url}${url}`;
    },
    [getPreviewUrl]
  );

  const getMarkdownSnippet = useCallback(
    (type: WidgetPreviewType): string => {
      const user = username || 'iKislay';
      const fullUrl = getFullPreviewUrl(type);

      if (type === 'skyline') {
        return `Check out my [GitHub Skyline 3D Contribution Graph](${user}-github-skyline.stl)!`;
      }

      let label: string;
      switch (type) {
        case 'github-stats':
          label = 'GitHub Stats';
          break;
        case 'summary-stats':
          label = 'GitHub Summary Stats';
          break;
        case 'summary-profile':
          label = 'GitHub Profile Summary';
          break;
        case 'summary-repos-lang':
          label = 'Repo Languages';
          break;
        case 'summary-commit-lang':
          label = 'Commit Languages';
          break;
        case 'summary-productive':
          label = 'Productive Time';
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

      return `[![${user}'s ${label}](${fullUrl})](https://github.com/${user})`;
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
