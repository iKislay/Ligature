'use client';

import { useState, useMemo } from 'react';
import type { IconInfo } from './page';

function IconCard({ icon }: { icon: IconInfo }) {
  const darkSrc = `/assets/skills-icon/${icon.name}-Dark.svg`;
  const lightSrc = `/assets/skills-icon/${icon.name}-Light.svg`;
  const singleSrc = `/assets/skills-icon/${icon.name}.svg`;

  if (icon.hasDark && icon.hasLight) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:border-blue-500/50">
        <div className="flex items-center justify-center">
          <img
            src={darkSrc}
            alt={`${icon.name} (dark)`}
            className="block h-16 w-16 dark:hidden"
            loading="lazy"
          />
          <img
            src={lightSrc}
            alt={`${icon.name} (light)`}
            className="hidden h-16 w-16 dark:block"
            loading="lazy"
          />
        </div>
        <span className="text-center text-xs font-medium text-muted-foreground">
          {icon.name}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:border-blue-500/50">
      <div className="flex items-center justify-center">
        <img
          src={singleSrc}
          alt={icon.name}
          className="h-16 w-16"
          loading="lazy"
        />
      </div>
      <span className="text-center text-xs font-medium text-muted-foreground">
        {icon.name}
      </span>
    </div>
  );
}

export function IconsPageClient({ icons }: { icons: IconInfo[] }) {
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return icons;
    const q = search.toLowerCase();
    return icons.filter(i => i.name.toLowerCase().includes(q));
  }, [search, icons]);

  return (
    <div className="mx-auto w-[95%] max-w-7xl px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Skill Icons</h1>
        <p className="text-muted-foreground">
          A collection of {icons.length} technology icons from{' '}
          <a
            href="https://github.com/tandpfun/skill-icons"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            skill-icons
          </a>
          . Theme-aware — switches between dark/light variants automatically.
        </p>
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mt-4 w-full max-w-md rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Showing {filteredIcons.length} of {icons.length} icons
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {filteredIcons.map(icon => (
          <IconCard key={icon.name} icon={icon} />
        ))}
      </div>
    </div>
  );
}
