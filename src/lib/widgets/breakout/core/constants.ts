/* ─── Re-export shared constants so breakout code has one import location ─── */
export { CELL_SIZE, DELTA_TIME, GAME_THEMES, GAP_SIZE, GRID_HEIGHT, GRID_WIDTH } from '../../shared/constants';

/* ───────────── Ball ───────────── */
/** Ball radius in grid units (slightly less than half a cell) */
export const BALL_RADIUS = 0.21;

/** Initial ball speed components (grid units per frame). The ratio is
 *  intentionally irrational so the ball path is non-repeating.
 *  Keep each component < 1.0 so the ball never skips over a grid cell. */
export const BALL_INITIAL_DX = 0.75;
export const BALL_INITIAL_DY = -0.95;

/* ───────────── Paddle ───────────── */
/** Paddle width in grid units */
export const PADDLE_WIDTH = 7;

/** Maximum horizontal distance the paddle moves per frame */
export const PADDLE_SPEED = 2.0;

/** Paddle Y position in grid units (just below the last row) */
export const PADDLE_Y = 7.4;

/** Paddle height in grid units */
export const PADDLE_HEIGHT = 0.5;

/**
 * Maximum bounce angle (degrees from vertical) when the ball hits the paddle edge.
 * Centre hit = straight up (0°). Far edge = MAX_BOUNCE_ANGLE either side.
 */
export const MAX_BOUNCE_ANGLE = 65;

/* ───────────── AI ───────────── */
/** If the ball has not hit a brick for this many frames, force-target
 *  the nearest remaining brick to avoid stalling. */
export const BALL_TARGETING_THRESHOLD = 10;

/* ───────────── Visual ───────────── */
export const BALL_COLOR = '#ffffff';
export const PADDLE_COLOR = '#ffffff';
export const BALL_SHADOW_COLOR = '#aaaaaa';
