import { GameTheme, ThemeKeys } from './types';

/* ───────────── Grid dimensions ───────────── */
export const CELL_SIZE = 20;
export const GAP_SIZE = 2;
export const GRID_WIDTH = 53; // 52 weeks + current week
export const GRID_HEIGHT = 7; // Sun … Sat

export const DELTA_TIME = 200;

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ───────────── Official GitHub / GitLab Palettes ─────────────
   5-color array: 0 = NONE … 4 = FOURTH_QUARTILE               */
const GITHUB_LIGHT = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
const GITHUB_DARK = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const GITLAB_LIGHT = ['#ececef', '#d2dcff', '#7992f5', '#4e65cd', '#303470'];
const GITLAB_DARK = ['#2a2a3d', '#4a5bdc', '#2e3dbf', '#1b2e8a', '#0f1a4e'];

const GEIST = ['#f5f5f5', '#dbeafe', '#93c5fd', '#3b82f6', '#006bff'];
const GEIST_DARK = ['#1a1a1a', '#1e293b', '#1d4ed8', '#2563eb', '#3b82f6'];
const CYBERPUNK = ['#1a0033', '#0d3d0d', '#00aa22', '#00dd33', '#00ff41'];
const MINIMAL = ['#e4e4e7', '#d4d4d8', '#a1a1aa', '#52525b', '#27272a'];
const RETRO = ['#eee8d5', '#e6dbb3', '#b58900', '#cb4b16', '#dc322f'];

/* ───────────── Game Themes ───────────── */
export const GAME_THEMES: { [key in ThemeKeys]: GameTheme } = {
	github: {
		textColor: '#57606a',
		gridBackground: '#ffffff',
		wallColor: '#000000',
		intensityColors: GITHUB_LIGHT
	},
	'github-dark': {
		textColor: '#8b949e',
		gridBackground: '#0d1117',
		wallColor: '#ffffff',
		intensityColors: GITHUB_DARK
	},
	gitlab: {
		textColor: '#626167',
		gridBackground: '#ffffff',
		wallColor: '#000000',
		intensityColors: GITLAB_LIGHT
	},
	'gitlab-dark': {
		textColor: '#999999',
		gridBackground: '#1f1f1f',
		wallColor: '#ffffff',
		intensityColors: GITLAB_DARK
	},
	geist: {
		textColor: '#171717',
		gridBackground: '#ffffff',
		wallColor: '#171717',
		intensityColors: GEIST
	},
	geist_dark: {
		textColor: '#ededed',
		gridBackground: '#0a0a0a',
		wallColor: '#ededed',
		intensityColors: GEIST_DARK
	},
	cyberpunk: {
		textColor: '#00ff41',
		gridBackground: '#0d0221',
		wallColor: '#ff003c',
		intensityColors: CYBERPUNK
	},
	cyberpunk_dark: {
		textColor: '#00ff41',
		gridBackground: '#0d0221',
		wallColor: '#ff003c',
		intensityColors: CYBERPUNK
	},
	minimal: {
		textColor: '#27272a',
		gridBackground: '#f4f4f5',
		wallColor: '#18181b',
		intensityColors: MINIMAL
	},
	minimal_dark: {
		textColor: '#fafafa',
		gridBackground: '#09090b',
		wallColor: '#fafafa',
		intensityColors: ['#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa']
	},
	retro: {
		textColor: '#657b83',
		gridBackground: '#fdf6e3',
		wallColor: '#cb4b16',
		intensityColors: RETRO
	},
	retro_dark: {
		textColor: '#93a1a1',
		gridBackground: '#002b36',
		wallColor: '#cb4b16',
		intensityColors: ['#073642', '#586e75', '#b58900', '#cb4b16', '#dc322f']
	}
};
