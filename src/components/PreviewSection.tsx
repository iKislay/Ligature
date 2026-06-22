'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';
import { themes } from '@/lib/themes';

const previewOptions = [
  { value: 'github', label: 'GitHub Stats' },
  { value: 'actions', label: 'GitHub Actions' },
  { value: 'games', label: 'Arcade Games' },
  { value: 'istime', label: 'IsTime' },
  { value: 'discord', label: 'Discord' },
  { value: 'forg', label: 'Forg' },
] as const;

const gameOptions = [
  { value: 'pacman', label: 'Pac-Man' },
  { value: 'bomberman', label: 'Bomberman' },
  { value: 'breakout', label: 'Breakout' },
  { value: 'galaga', label: 'Galaga' },
  { value: 'puzzle-bobble', label: 'Puzzle Bobble' },
  { value: 'minesweeper', label: 'Minesweeper' },
] as const;

const themeKeys = Object.keys(themes);

export function PreviewSection() {
  const [selectedTab, setSelectedTab] = useState<'github' | 'games' | 'istime' | 'discord' | 'forg'>('github');
  const [username, setUsername] = useState('torvalds');
  const [selectedTheme, setSelectedTheme] = useState('geist');
  const [selectedGame, setSelectedGame] = useState('pacman');
  const [copied, setCopied] = useState(false);

  const isGame = selectedTab === 'games';
  const imageUrl = isGame 
    ? `/api/games?user=${username || 'torvalds'}&game=${selectedGame}`
    : `/api/github?user=${username || 'torvalds'}&theme=${selectedTheme}`;
  const fullImageUrl = `https://ligature.dev${imageUrl}`;
  const markdownSnippet = `[![${username}'s ${isGame ? 'Game' : 'GitHub'} Stats](${fullImageUrl})](https://github.com/${username})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12" id="customizer">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {previewOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedTab(option.value as any)}
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

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block" />

          {/* Controls */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="h-9 px-3 w-32 md:w-40 rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-neutral-300"
            />
            {isGame ? (
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-neutral-300 capitalize appearance-none"
              >
                {gameOptions.map((g) => (
                  <option key={g.value} value={g.value} className="bg-white dark:bg-neutral-900">
                    {g.label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:focus:ring-neutral-300 capitalize appearance-none"
              >
                {themeKeys.map((t) => (
                  <option key={t} value={t} className="bg-white dark:bg-neutral-900">
                    {t}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleCopy}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm font-medium hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 transition-colors"
              title="Copy Markdown Snippet"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <Link href="#docs" className="text-sm font-medium underline underline-offset-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors">
          View documentation
        </Link>
      </div>

      <div className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 md:p-12 flex items-center justify-center min-h-[400px]">
        {selectedTab === 'github' || selectedTab === 'games' ? (
          <img 
            src={imageUrl} 
            alt={`${selectedTab === 'games' ? 'Games' : 'GitHub'} Widget Preview`}
            className="w-full max-w-[800px] shadow-lg rounded-xl border border-neutral-200 dark:border-neutral-800"
          />
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <h3 className="text-xl font-semibold tracking-tight">Coming Soon</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm">
              The {selectedTab} widget is currently in development and will be available in Phase 2.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
