/* ─── Re-export shared constants so puzzle-bobble code has one import location ─── */
export { CELL_SIZE, DELTA_TIME, GAME_THEMES, GAP_SIZE, GRID_HEIGHT, GRID_WIDTH } from '../../shared/constants';

/* ───────────── Cannon ───────────── */
/** SVG-space X of the cannon (horizontally centered on the grid) */
export const CANNON_Y_OFFSET = 55; // px below grid bottom, within cannon area

/** Min/max cannon angle in degrees (90 = straight up) */
export const CANNON_ANGLE_MIN = 10;
export const CANNON_ANGLE_MAX = 170;

/** Cannon turn speed in degrees per frame */
export const CANNON_TURN_SPEED = 6;

/* ───────────── Bubble physics ───────────── */
/** Bubble travel speed in SVG pixels per frame */
export const BUBBLE_SPEED = 10;

/** Radius of a bubble in SVG pixels (slightly smaller than half CELL_SIZE so it fits) */
export const BUBBLE_RADIUS = 9;

/* ───────────── Pop logic ───────────── */
/** Minimum connected same-color cluster size to trigger a pop */
export const POP_MIN_CLUSTER = 3;

/** Number of frames the pop burst animation lasts */
export const POP_BURST_FRAMES = 8;

/* ───────────── Cannon area ───────────── */
/** Height in SVG pixels reserved below the grid for the cannon */
export const CANNON_AREA_HEIGHT = 80;

/** Divisor applied to total frame count when computing SVG animation duration.
 *  Higher = faster playback. */
export const PB_ANIM_SPEED_FACTOR = 6;

/* ───────────── Bubble palette ───────────── */
/**
 * Fixed 6-colour palette used for Puzzle Bobble bubbles.
 * A subset of these is used depending on how many cells are occupied:
 * ≤50 → 2 colours, ≤150 → 3, ≤250 → 4, ≤350 → 5, >350 → 6
 */
export const PB_COLORS: readonly string[] = [
	'#e74c3c', // red
	'#f1c40f', // yellow
	'#2ecc71', // green
	'#3498db', // blue
	'#9b59b6', // purple
	'#e67e22' // orange
] as const;
