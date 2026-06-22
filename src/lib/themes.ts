export type Theme = {
  name: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    border: string;
  };
  typography: {
    fontFamily: string;
  };
  effects: {
    glowRadius?: string;
    grain?: boolean;
    scanlines?: boolean;
  };
};

export const themes: Record<string, Theme> = {
  geist: {
    name: 'geist',
    colors: {
      background: '#ffffff',
      text: '#171717',
      primary: '#006bff',
      secondary: '#4d4d4d',
      border: '#eaeaea',
    },
    typography: {
      fontFamily: '"Geist Sans", sans-serif',
    },
    effects: {},
  },
  geist_dark: {
    name: 'geist_dark',
    colors: {
      background: '#0a0a0a',
      text: '#ededed',
      primary: '#006bff',
      secondary: '#a1a1aa',
      border: '#333333',
    },
    typography: {
      fontFamily: '"Geist Sans", sans-serif',
    },
    effects: {},
  },
  cyberpunk: {
    name: 'cyberpunk',
    colors: {
      background: '#0d0221',
      text: '#00ff41',
      primary: '#ff003c',
      secondary: '#00e5ff',
      border: '#ff003c',
    },
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
    colors: {
      background: '#f4f4f5',
      text: '#27272a',
      primary: '#18181b',
      secondary: '#71717a',
      border: '#e4e4e7',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    effects: {},
  },
  retro: {
    name: 'retro',
    colors: {
      background: '#fdf6e3',
      text: '#657b83',
      primary: '#cb4b16',
      secondary: '#2aa198',
      border: '#eee8d5',
    },
    typography: {
      fontFamily: '"Courier New", monospace',
    },
    effects: {
      grain: true,
    },
  },
};

export const getTheme = (name: string): Theme => {
  return themes[name] || themes.geist;
};
