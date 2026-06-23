export type ThemeColors = {
  background?: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
  contributionEmpty: string;
};

export type Theme = {
  name: string;
  colors: ThemeColors;
  light: ThemeColors;
  dark: ThemeColors;
  typography: {
    fontFamily: string;
  };
  effects: {
    glowRadius?: string;
    grain?: boolean;
    scanlines?: boolean;
  };
};

export type ThemeMode = 'light' | 'dark';

export const themes: Record<string, Theme> = {
  geist: {
    name: 'geist',
    light: {
      background: '#ffffff',
      text: '#171717',
      primary: '#006bff',
      secondary: '#6b7280',
      border: '#e5e7eb',
      contributionEmpty: '#ebedf0',
    },
    dark: {
      background: '#0a0a0a',
      text: '#ededed',
      primary: '#3b82f6',
      secondary: '#9ca3af',
      border: '#374151',
      contributionEmpty: '#161b22',
    },
    colors: {} as ThemeColors,
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    effects: {},
  },
  cyberpunk: {
    name: 'cyberpunk',
    light: {
      background: '#f5f0ff',
      text: '#1a0033',
      primary: '#ff003c',
      secondary: '#6b21a8',
      border: '#e9d5ff',
      contributionEmpty: '#f3e8ff',
    },
    dark: {
      background: '#0d0221',
      text: '#00ff41',
      primary: '#ff003c',
      secondary: '#00e5ff',
      border: '#ff003c',
      contributionEmpty: '#1a0033',
    },
    colors: {} as ThemeColors,
    typography: {
      fontFamily: 'monospace',
    },
    effects: {
      glowRadius: '4px',
      scanlines: true,
    },
  },
  minimal: {
    name: 'minimal',
    light: {
      background: '#f4f4f5',
      text: '#27272a',
      primary: '#18181b',
      secondary: '#71717a',
      border: '#e4e4e7',
      contributionEmpty: '#e4e4e7',
    },
    dark: {
      background: '#09090b',
      text: '#fafafa',
      primary: '#fafafa',
      secondary: '#a1a1aa',
      border: '#27272a',
      contributionEmpty: '#27272a',
    },
    colors: {} as ThemeColors,
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    effects: {},
  },
  retro: {
    name: 'retro',
    light: {
      background: '#fdf6e3',
      text: '#657b83',
      primary: '#cb4b16',
      secondary: '#2aa198',
      border: '#eee8d5',
      contributionEmpty: '#eee8d5',
    },
    dark: {
      background: '#002b36',
      text: '#93a1a1',
      primary: '#cb4b16',
      secondary: '#2aa198',
      border: '#586e75',
      contributionEmpty: '#073642',
    },
    colors: {} as ThemeColors,
    typography: {
      fontFamily: '"Courier New", monospace',
    },
    effects: {
      grain: true,
    },
  },
};

export const getTheme = (name: string, mode?: ThemeMode): Theme => {
  const base = themes[name] || themes.geist;
  const resolvedMode = mode || 'light';
  return {
    ...base,
    colors: resolvedMode === 'dark' ? { ...base.dark } : { ...base.light },
  };
};

export const getThemeColors = (name: string, mode: ThemeMode = 'light'): ThemeColors => {
  const theme = themes[name] || themes.geist;
  return mode === 'dark' ? theme.dark : theme.light;
};
