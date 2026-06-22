'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { WidgetPreviewType, useWidgetPreview } from '@/hooks/use-widget-preview';

const THEME_OPTIONS = ['geist', 'geist_dark', 'cyberpunk', 'minimal', 'retro'] as const;

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
  skyline: 'GitHub Skyline',
  trends: 'GitHub Trends',
  actions: 'GitHub Actions',
};

interface AuthGateProps {
  onConnect: () => void;
  fallbackImage?: string;
  title?: string;
}

function AuthGate({ onConnect, fallbackImage, title }: AuthGateProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6 py-8">
      {fallbackImage && (
        <img
          src={fallbackImage}
          alt={`${title ?? 'Widget'} preview`}
          className="w-full max-w-[600px] rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm opacity-60"
        />
      )}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <svg className="size-5 text-neutral-600 dark:text-neutral-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Connect GitHub to preview your {title ?? 'widget'}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
            See your live data with a single click
          </p>
        </div>
        <button
          onClick={onConnect}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          Connect with GitHub
        </button>
      </div>
    </div>
  );
}

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-900">
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
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
      className="w-full max-w-[800px] rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm"
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
  requiresAuth = false,
  fallbackImage,
}: WidgetPreviewProps) {
  const {
    username,
    setUsername,
    theme,
    setTheme,
    copied,
    getPreviewUrl,
    getFullPreviewUrl,
    getMarkdownSnippet,
    handleCopy,
  } = useWidgetPreview();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(requiresAuth);

  useEffect(() => {
    if (!requiresAuth) {
      setCheckingAuth(false);
      return;
    }

    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(data.authenticated);
        setCheckingAuth(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setCheckingAuth(false);
      });
  }, [requiresAuth]);

  const relativeUrl = getPreviewUrl(type);
  const fullImageUrl = getFullPreviewUrl(type);
  const markdownSnippet = getMarkdownSnippet(type);
  const needsAuthGate = requiresAuth && !checkingAuth && !isAuthenticated;
  const showThemeSelector = type !== 'skyline' && type !== 'trends' && type !== 'actions';
  const widgetLabel = WIDGET_LABELS[type] ?? type;

  return (
    <div className="my-8 w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
      <div className="flex min-h-[280px] items-center justify-center bg-white p-4 md:p-8 dark:bg-black">
        {checkingAuth ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <div className="size-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
            Checking authentication...
          </div>
        ) : needsAuthGate ? (
          <AuthGate
            onConnect={() => signIn('github', { callbackUrl: window.location.href })}
            fallbackImage={fallbackImage}
            title={widgetLabel}
          />
        ) : (
          <PreviewImage src={relativeUrl} alt={`${widgetLabel} preview for ${username}`} />
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHub username"
          disabled={needsAuthGate}
          className="h-9 w-36 rounded-md border border-neutral-200 bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:opacity-50 dark:border-neutral-800 dark:focus:ring-neutral-300 md:w-44"
        />
        {showThemeSelector && (
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="h-9 rounded-md border border-neutral-200 bg-transparent px-3 text-sm capitalize focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:focus:ring-neutral-300"
          >
            {THEME_OPTIONS.map((t) => (
              <option key={t} value={t} className="bg-white dark:bg-neutral-900">
                {t.replace('_', ' ')}
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
