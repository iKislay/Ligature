'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { memo, useEffect, useMemo, useState } from 'react';

async function fetchGitHubStars(): Promise<number | null> {
  try {
    const response = await fetch('https://api.github.com/repos/iKislay/Ligature', {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}

const DEFAULT_STAR_COUNT = 0;

export const Hero = memo(function Hero() {
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    fetchGitHubStars().then(setStarCount);
  }, []);

  const displayStarCount = useMemo(
    () => (starCount !== null ? starCount : DEFAULT_STAR_COUNT).toLocaleString(),
    [starCount]
  );

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex flex-wrap items-center justify-center gap-2">
          Stateless SVG Widgets for
          <span className="inline-flex items-center gap-2 px-1 text-blue-600 dark:text-blue-400">
            GitHub
          </span>
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl">
          Ready-to-use, customizable embeds for your README. Unify your GitHub stats, IsTime hours, Forg data, and Discord presence under a single design system.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-0 rounded-md overflow-hidden shadow-sm border border-neutral-200 dark:border-neutral-800">
          <Link
            href="#customizer"
            className="h-11 px-6 flex items-center bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            Build Widget
          </Link>
          <div className="h-11 w-[1px] bg-neutral-800 dark:bg-neutral-200" />
          <Link
            href="https://github.com/iKislay/Ligature"
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-4 flex items-center bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            GitHub
          </Link>
          <div className="h-11 w-[1px] bg-neutral-200 dark:bg-neutral-800" />
          <Link
            href="https://github.com/iKislay/Ligature"
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-4 flex items-center gap-2 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Star className="w-4 h-4" />
            <span>{displayStarCount}</span>
          </Link>
        </div>
      </div>
    </section>
  );
});
