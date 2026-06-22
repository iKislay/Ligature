import type { SummaryCardTheme } from './card';

export const SUMMARY_CARD_THEMES: Record<string, SummaryCardTheme> = {
  default: {
    title: '#586e75',
    text: '#586e75',
    background: '#ffffff',
    stroke: '#e4e2e2',
    strokeOpacity: 1,
    icon: '#586e75',
    chart: '#586e75',
  },
  dark: {
    title: '#0366d6',
    text: '#77909c',
    background: '#0d1117',
    stroke: '#2e343b',
    strokeOpacity: 1,
    icon: '#8b949e',
    chart: '#40c463',
  },
  dracula: {
    title: '#ff6e96',
    text: '#ff6e96',
    background: '#282a36',
    stroke: '#1e1f29',
    strokeOpacity: 1,
    icon: '#bd93f9',
    chart: '#ff6e96',
  },
  github: {
    title: '#586e75',
    text: '#586e75',
    background: '#ffffff',
    stroke: '#e4e2e2',
    strokeOpacity: 1,
    icon: '#586e75',
    chart: '#586e75',
  },
  github_dark: {
    title: '#0366d6',
    text: '#77909c',
    background: '#0d1117',
    stroke: '#2e343b',
    strokeOpacity: 1,
    icon: '#8b949e',
    chart: '#40c463',
  },
  tokyonight: {
    title: '#7dcfff',
    text: '#7dcfff',
    background: '#1a1b26',
    stroke: '#24283b',
    strokeOpacity: 1,
    icon: '#7aa2f7',
    chart: '#7dcfff',
  },
  radical: {
    title: '#8b5cf6',
    text: '#e2e8f0',
    background: '#141118',
    stroke: '#2d2435',
    strokeOpacity: 1,
    icon: '#8b5cf6',
    chart: '#f97316',
  },
  gruvbox: {
    title: '#d79921',
    text: '#d79921',
    background: '#282828',
    stroke: '#3c3836',
    strokeOpacity: 1,
    icon: '#83a598',
    chart: '#d79921',
  },
  nord_bright: {
    title: '#81a1c1',
    text: '#81a1c1',
    background: '#ffffff',
    stroke: '#e5e9f0',
    strokeOpacity: 1,
    icon: '#5e81ac',
    chart: '#81a1c1',
  },
  nord_dark: {
    title: '#81a1c1',
    text: '#81a1c1',
    background: '#2e3440',
    stroke: '#3b4252',
    strokeOpacity: 1,
    icon: '#5e81ac',
    chart: '#81a1c1',
  },
  solarized: {
    title: '#b58900',
    text: '#657b83',
    background: '#fdf6e3',
    stroke: '#eee8d5',
    strokeOpacity: 1,
    icon: '#268bd2',
    chart: '#b58900',
  },
  solarized_dark: {
    title: '#b58900',
    text: '#839496',
    background: '#002b36',
    stroke: '#073642',
    strokeOpacity: 1,
    icon: '#268bd2',
    chart: '#b58900',
  },
  monokai: {
    title: '#a6e22e',
    text: '#f8f8f2',
    background: '#272822',
    stroke: '#3e3d32',
    strokeOpacity: 1,
    icon: '#f92672',
    chart: '#a6e22e',
  },
  vue: {
    title: '#273849',
    text: '#273849',
    background: '#ffffff',
    stroke: '#e4e2e2',
    strokeOpacity: 1,
    icon: '#41b883',
    chart: '#41b883',
  },
  zenburn: {
    title: '#dcdccc',
    text: '#dcdccc',
    background: '#3f3f3f',
    stroke: '#4f4f4f',
    strokeOpacity: 1,
    icon: '#8cd0d3',
    chart: '#dcdccc',
  },
};

export function getSummaryTheme(name: string): SummaryCardTheme {
  return SUMMARY_CARD_THEMES[name] ?? SUMMARY_CARD_THEMES.default;
}

export function getAllSummaryThemeNames(): string[] {
  return Object.keys(SUMMARY_CARD_THEMES);
}

const ICON_MAP: Record<string, string> = {
  star: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/></svg>',
  repo: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.25.25 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>',
  commit: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/></svg>',
  pr: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854v2.229a.25.25 0 0 0 .177.24l2.537.776a.248.248 0 0 1 .047.46L7.81 8.057a.25.25 0 0 0-.061.038L5.387 9.683a.748.748 0 0 1-.155 1.292l-2.318.774a.75.75 0 0 1-.422-1.438l1.644-.621.582-2.282.022-.007.15-.06a.75.75 0 0 1 .309-.058l2.234.446.447-2.008a.75.75 0 0 1 .383-.509l1.597-.797-.032-.01-.032-.01L6.56 4.602a.25.25 0 0 0-.286-.137l-1.82.455a.25.25 0 0 1-.244-.075L3.69 4.18h-.001a.25.25 0 0 1 .04-.365l2.802-2.136a.75.75 0 0 1 .917-.002l.207.164a.25.25 0 0 1 .07.124l.006.036a.25.25 0 0 1-.057.22Z"/></svg>',
  issue: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/></svg>',
  fork: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>',
  clock: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7.25-3.25v2.992l2.954.554a.75.75 0 0 1-.312 1.464l-3.384-.64a.75.75 0 0 1-.633-.636L7.01 4.374a.75.75 0 0 1 .763-.781.755.755 0 0 1 .75.75l.009.033.218.628Z"/></svg>',
  collaborator: '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.507 5.507 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.49 3.49 0 0 1 2 5.5ZM11 4a.75.75 0 1 0 0 1.5 1.5 1.5 0 0 1 .666 2.844.75.75 0 0 0-.416.672v.352a.75.75 0 0 0 .574.73c1.2.289 2.162 1.2 2.522 2.372a.75.75 0 0 0 1.434-.44 5.01 5.01 0 0 0-2.56-3.012A3 3 0 0 0 11 4Z"/></svg>',
};

export function getIcon(name: string): string {
  return ICON_MAP[name] ?? ICON_MAP.star;
}
