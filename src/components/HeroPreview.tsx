'use client';

import { useState, useEffect } from 'react';
import { themes } from '@/lib/themes';

const themeKeys = Object.keys(themes);

export default function HeroPreview() {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThemeIndex((prev) => (prev + 1) % themeKeys.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeTheme = themeKeys[currentThemeIndex];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto my-16">
      <div className="relative w-full aspect-[2/1] bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center border border-neutral-200 dark:border-neutral-800 shadow-2xl transition-all duration-700">
        <img
          src={`/api/github?user=octocat&theme=${activeTheme}`}
          alt={`GitHub Widget Preview in ${activeTheme} theme`}
          className="w-[800px] max-w-[90%] h-auto rounded-xl shadow-lg transition-opacity duration-500"
          style={{ width: '800px' }}
        />
        
        <div className="absolute bottom-6 left-6 flex space-x-2">
          {themeKeys.map((t, i) => (
            <div
              key={t}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === currentThemeIndex ? 'w-8 bg-neutral-800 dark:bg-neutral-200' : 'w-2 bg-neutral-400 dark:bg-neutral-600'
              }`}
            />
          ))}
        </div>
        <div className="absolute top-6 right-6">
          <span className="text-xs font-mono px-3 py-1 bg-white/80 dark:bg-black/80 backdrop-blur rounded-full text-neutral-800 dark:text-neutral-200 shadow border border-neutral-200 dark:border-neutral-800 uppercase tracking-widest">
            {activeTheme}
          </span>
        </div>
      </div>
    </div>
  );
}
