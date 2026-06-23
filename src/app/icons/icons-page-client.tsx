'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { IconInfo } from './page';

// ─── Framework code generators ────────────────────────────────────────────────

function getIconUrl(name: string, variant: 'dark' | 'light' | 'single'): string {
  if (variant === 'dark') return `/assets/skills-icon/${name}-Dark.svg`;
  if (variant === 'light') return `/assets/skills-icon/${name}-Light.svg`;
  return `/assets/skills-icon/${name}.svg`;
}

function resolveIconPath(icon: IconInfo): string {
  if (icon.hasSingle) return getIconUrl(icon.name, 'single');
  if (icon.hasDark) return getIconUrl(icon.name, 'dark');
  return getIconUrl(icon.name, 'light');
}

function getFrameworkCode(icon: IconInfo, framework: string): string {
  const darkSrc = `https://ligatures.netlify.app/assets/skills-icon/${icon.name}-Dark.svg`;
  const lightSrc = `https://ligatures.netlify.app/assets/skills-icon/${icon.name}-Light.svg`;
  const singleSrc = `https://ligatures.netlify.app/assets/skills-icon/${icon.name}.svg`;
  const src = icon.hasSingle ? singleSrc : darkSrc;
  const altText = `${icon.name} icon`;
  const iconSlug = icon.name.toLowerCase();

  switch (framework) {
    case 'React':
      if (icon.hasDark && icon.hasLight) {
        return `import { useTheme } from 'next-themes';

export function ${icon.name.replace(/[^a-zA-Z0-9]/g, '')}Icon() {
  const { resolvedTheme } = useTheme();
  const src = resolvedTheme === 'dark'
    ? '${lightSrc}'
    : '${darkSrc}';
  return <img src={src} alt="${altText}" width={48} height={48} />;
}`;
      }
      return `export function ${icon.name.replace(/[^a-zA-Z0-9]/g, '')}Icon() {
  return <img src="${src}" alt="${altText}" width={48} height={48} />;
}`;

    case 'Web':
      if (icon.hasDark && icon.hasLight) {
        return `<!-- HTML (theme-aware via CSS prefers-color-scheme) -->
<picture>
  <source
    srcset="${lightSrc}"
    media="(prefers-color-scheme: dark)"
  />
  <img
    src="${darkSrc}"
    alt="${altText}"
    width="48"
    height="48"
  />
</picture>`;
      }
      return `<!-- HTML -->
<img
  src="${src}"
  alt="${altText}"
  width="48"
  height="48"
/>`;

    case 'Vue':
      if (icon.hasDark && icon.hasLight) {
        return `<template>
  <img :src="iconSrc" alt="${altText}" :width="48" :height="48" />
</template>

<script setup>
import { computed } from 'vue';
import { useColorMode } from '@vueuse/core';

const colorMode = useColorMode();
const iconSrc = computed(() =>
  colorMode.value === 'dark'
    ? '${lightSrc}'
    : '${darkSrc}'
);
</script>`;
      }
      return `<template>
  <img src="${src}" alt="${altText}" :width="48" :height="48" />
</template>`;

    case 'Flutter':
      return `import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class ${icon.name.replace(/[^a-zA-Z0-9]/g, '')}Icon extends StatelessWidget {
  const ${icon.name.replace(/[^a-zA-Z0-9]/g, '')}Icon({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return SvgPicture.network(
      isDark
        ? '${icon.hasDark ? lightSrc : src}'
        : '${icon.hasDark ? darkSrc : src}',
      width: 48,
      height: 48,
    );
  }
}`;

    case 'Elm':
      return `module Icons.${icon.name.replace(/[^a-zA-Z0-9]/g, '')} exposing (view)

import Html exposing (Html, img)
import Html.Attributes exposing (alt, height, src, width)


view : Html msg
view =
    img
        [ src "${src}"
        , alt "${altText}"
        , width 48
        , height 48
        ]
        []`;

    case 'Swift':
      return `import SwiftUI

struct ${icon.name.replace(/[^a-zA-Z0-9]/g, '')}Icon: View {
    @Environment(\\.colorScheme) var colorScheme

    var iconURL: URL? {
        let urlString = colorScheme == .dark
            ? "${icon.hasDark ? lightSrc : src}"
            : "${icon.hasDark ? darkSrc : src}"
        return URL(string: urlString)
    }

    var body: some View {
        AsyncImage(url: iconURL) { image in
            image.resizable().scaledToFit()
        } placeholder: {
            ProgressView()
        }
        .frame(width: 48, height: 48)
    }
}`;

    default:
      return '';
  }
}

// ─── Icon Card ────────────────────────────────────────────────────────────────

function IconCard({
  icon,
  onClick,
  isSelected,
}: {
  icon: IconInfo;
  onClick: (icon: IconInfo) => void;
  isSelected: boolean;
}) {
  const darkSrc = getIconUrl(icon.name, 'dark');
  const lightSrc = getIconUrl(icon.name, 'light');
  const singleSrc = getIconUrl(icon.name, 'single');

  return (
    <button
      onClick={() => onClick(icon)}
      className={`group flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md dark:bg-blue-950/30'
          : 'border-border bg-card hover:border-blue-400/60 hover:bg-accent/50'
      }`}
      aria-label={`Select ${icon.name} icon`}
    >
      <div className="flex h-12 w-12 items-center justify-center">
        {icon.hasDark && icon.hasLight ? (
          <>
            <img
              src={darkSrc}
              alt={`${icon.name} dark`}
              className="block h-12 w-12 dark:hidden"
              loading="lazy"
            />
            <img
              src={lightSrc}
              alt={`${icon.name} light`}
              className="hidden h-12 w-12 dark:block"
              loading="lazy"
            />
          </>
        ) : (
          <img
            src={singleSrc}
            alt={icon.name}
            className="h-12 w-12"
            loading="lazy"
          />
        )}
      </div>
      <span className="w-full truncate text-center text-xs font-medium text-muted-foreground">
        {icon.name}
      </span>
    </button>
  );
}

// ─── Copy button with feedback ────────────────────────────────────────────────

function CopyButton({
  text,
  label,
  className = '',
}: {
  text: string | (() => Promise<string>);
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const content = typeof text === 'function' ? await text() : text;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:shadow-sm active:scale-95 ${className}`}
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ─── Download button ──────────────────────────────────────────────────────────

function DownloadButton({
  href,
  filename,
  label,
  fetchRaw = false,
}: {
  href: string;
  filename: string;
  label: string;
  fetchRaw?: boolean;
}) {
  const handleDownload = async () => {
    if (fetchRaw) {
      const res = await fetch(href);
      const text = await res.text();
      const blob = new Blob([text], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      a.click();
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:shadow-sm active:scale-95"
    >
      <DownloadIcon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

// ─── Bottom Modal Drawer ──────────────────────────────────────────────────────

const FRAMEWORK_TABS = ['Tags', 'React', 'Web', 'Vue', 'Flutter', 'Elm', 'Swift'] as const;
type FrameworkTab = (typeof FRAMEWORK_TABS)[number];

function IconDrawer({
  icon,
  onClose,
}: {
  icon: IconInfo;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<FrameworkTab>('Tags');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const darkSrc = getIconUrl(icon.name, 'dark');
  const lightSrc = getIconUrl(icon.name, 'light');
  const singleSrc = getIconUrl(icon.name, 'single');
  const primarySrc = resolveIconPath(icon);

  const getSvgContent = useCallback(async (src: string) => {
    const res = await fetch(src);
    return res.text();
  }, []);

  const tags = icon.name
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .split(/[\s-_]+/)
    .filter(Boolean);

  const frameworkCode = activeTab !== 'Tags' ? getFrameworkCode(icon, activeTab) : '';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${icon.name} icon details`}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-4xl rounded-t-2xl border border-border bg-background shadow-2xl"
        style={{ animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 px-4 pb-3 pt-2 sm:px-6">
          {/* Icon preview */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-card p-2">
            {icon.hasDark && icon.hasLight ? (
              <>
                <img src={darkSrc} alt={`${icon.name} dark`} className="block h-10 w-10 dark:hidden" />
                <img src={lightSrc} alt={`${icon.name} light`} className="hidden h-10 w-10 dark:block" />
              </>
            ) : (
              <img src={singleSrc} alt={icon.name} className="h-10 w-10" />
            )}
          </div>

          {/* Name & meta */}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold leading-tight">{icon.name}</h2>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {icon.hasDark && <span>Dark variant</span>}
              {icon.hasLight && <span>Light variant</span>}
              {icon.hasSingle && <span>Single variant</span>}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Action buttons row */}
        <div className="border-t border-border px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {/* Download SVG */}
            <DownloadButton
              href={primarySrc}
              filename={`${icon.name}.svg`}
              label="Download SVG"
            />
            {/* Copy SVG (as <img> tag) */}
            <CopyButton
              text={`<img src="https://ligatures.netlify.app${primarySrc}" alt="${icon.name}" width="48" height="48" />`}
              label="Copy SVG"
            />
            {/* Download Raw SVG */}
            <DownloadButton
              href={primarySrc}
              filename={`${icon.name}-raw.svg`}
              label="Download Raw SVG"
              fetchRaw
            />
            {/* Copy Raw SVG */}
            <CopyButton
              text={() => getSvgContent(primarySrc)}
              label="Copy Raw SVG"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-border">
          <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 pt-3 sm:px-6">
            {FRAMEWORK_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="max-h-52 overflow-y-auto px-4 py-3 sm:px-6">
            {activeTab === 'Tags' ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {/* Also show variant info as tags */}
                {icon.hasDark && (
                  <span className="rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                    dark-variant
                  </span>
                )}
                {icon.hasLight && (
                  <span className="rounded-md border border-yellow-300 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300">
                    light-variant
                  </span>
                )}
              </div>
            ) : (
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-surface-foreground">
                  <code>{frameworkCode}</code>
                </pre>
                <div className="absolute right-2 top-2">
                  <CopyButton
                    text={frameworkCode}
                    label="Copy"
                    className="!py-1 !px-2 !text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom safe area */}
        <div className="h-4" />
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function IconsPageClient({ icons }: { icons: IconInfo[] }) {
  const [search, setSearch] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconInfo | null>(null);

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return icons;
    const q = search.toLowerCase();
    return icons.filter((i) => i.name.toLowerCase().includes(q));
  }, [search, icons]);

  const handleSelectIcon = useCallback((icon: IconInfo) => {
    setSelectedIcon((prev) => (prev?.name === icon.name ? null : icon));
  }, []);

  const handleClose = useCallback(() => setSelectedIcon(null), []);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">Skill Icons</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          A collection of{' '}
          <span className="font-semibold text-foreground">{icons.length}</span> technology icons
          from{' '}
          <a
            href="https://github.com/tandpfun/skill-icons"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            skill-icons
          </a>
          . Click any icon to see usage snippets &amp; download options.
        </p>

        {/* Search */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search icons…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="shrink-0 text-xs text-muted-foreground">
            Showing <span className="font-medium">{filteredIcons.length}</span> of{' '}
            <span className="font-medium">{icons.length}</span>
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12">
        {filteredIcons.map((icon) => (
          <IconCard
            key={icon.name}
            icon={icon}
            onClick={handleSelectIcon}
            isSelected={selectedIcon?.name === icon.name}
          />
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <SearchIcon className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium">No icons found</p>
          <p className="text-sm text-muted-foreground">
            Try searching with a different keyword.
          </p>
          <button
            onClick={() => setSearch('')}
            className="mt-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-accent"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Bottom drawer */}
      {selectedIcon && (
        <IconDrawer icon={selectedIcon} onClose={handleClose} />
      )}
    </div>
  );
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
