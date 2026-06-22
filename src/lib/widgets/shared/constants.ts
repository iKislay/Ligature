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
	}
};
