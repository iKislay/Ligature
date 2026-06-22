import { BaseConfig, BaseStore, Contribution, GridCell } from '../shared/types';

export interface Ball {
	/** Continuous x position in grid units (0 … GRID_WIDTH) */
	x: number;
	/** Continuous y position in grid units (0 … GRID_HEIGHT) */
	y: number;
	/** Horizontal velocity in grid units per frame */
	dx: number;
	/** Vertical velocity in grid units per frame */
	dy: number;
}

export interface Paddle {
	/** Left-edge x position in grid units (0 … GRID_WIDTH - width) */
	x: number;
	/** Width in grid units */
	width: number;
}

export interface BreakoutStoreType extends BaseStore {
	frameCount: number;
	contributions: Contribution[];
	ball: Ball;
	paddle: Paddle;
	grid: GridCell[][];
	monthLabels: string[];
	/** Frames elapsed since the ball last broke a brick (used for targeting) */
	framesSinceLastBrickHit: number;
	/** Current target brick the AI is aiming at (null when none remain) */
	targetBrick: { cx: number; cy: number } | null;
	/** Paddle bounces since the current target was set — retarget after 5 misses */
	bouncesSinceTargetSet: number;
	/** Per-frame ball/paddle snapshots (no grid — grid changes tracked in brickEvents) */
	gameHistory: { ball: Ball; paddle: Paddle }[];
	/** Initial cell colors before any bricks are hit [col][row] */
	initialColors: string[][];
	/** Ordered list of brick color-change events keyed by gameHistory frame index */
	brickEvents: { frameIndex: number; x: number; y: number; color: string }[];
	config: BreakoutConfig;
}

export interface BreakoutConfig extends BaseConfig {
	// No additional options beyond BaseConfig for now
}
