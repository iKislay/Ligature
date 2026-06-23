'use client';

import React, { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

interface GithubProfileCardProps {
  username: string;
  theme?: string;
  mode?: ThemeMode;
  format?: 'svg' | 'png';
  className?: string;
}

function useSystemMode(): 'light' | 'dark' {
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemMode(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setSystemMode(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return systemMode;
}

export function GithubProfileCard({
  username,
  theme = 'geist',
  mode = 'auto',
  format = 'svg',
  className,
}: GithubProfileCardProps) {
  const systemMode = useSystemMode();
  const resolvedMode = mode === 'auto' ? systemMode : mode;
  const src = `/api/github/profile?user=${encodeURIComponent(username)}&theme=${encodeURIComponent(theme)}&mode=${resolvedMode}&format=${format}`;

  return (
    <img
      src={src}
      alt={`${username}'s GitHub profile overview`}
      className={className}
      style={{ maxWidth: '840px', width: '100%' }}
    />
  );
}
