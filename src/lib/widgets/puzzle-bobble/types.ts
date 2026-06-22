import { BaseConfig, BaseStore } from '../shared/types';

/** A bubble travelling from the cannon toward the grid */
export interface PBBubble {
	/** Unique id for animation tracking */
	id: number;
	/** SVG-space x position */
	x: number;
	/** SVG-space y position */
	y: number;
	/** SVG-space x velocity per frame */
	vx: number;
	/** SVG-space y velocity per frame (negative = upward) */
	vy: number;
	/** Contribution level color index (1-4) */
	colorIndex: number;
	active: boolean;
}

export interface PBCannonState {
	/** Angle in degrees: 90 = straight up, [30, 150] */
	angleDeg: number;
}

export interface PBStoreType extends BaseStore {
	frameCount: number;
	nextBubbleId: number;
	nextBubbleColorIndex: number;
	/** Color index currently loaded in (or being fired from) the cannon */
	currentBubbleColorIndex: number;
	/** Cached target angle for the cannon; -1 = needs recompute */
	cannonTargetAngle: number;
	cannon: PBCannonState;
	activeBubble: PBBubble | null;
	/** Per-frame snapshots */
	gameHistory: { cannon: PBCannonState; activeBubble: PBBubble | null; nextBubbleColorIndex: number; currentBubbleColorIndex: number }[];
	/** Initial cell colors before any bubbles are popped [col][row] */
	initialColors: string[][];
	/** Palette color index (into PB_COLORS) for each cell [col][row]; -1 = empty */
	cellBubbleColors: number[][];
	/** Ordered list of cell color-change events keyed by gameHistory frame index */
	cellEvents: { frameIndex: number; x: number; y: number; color: string }[];
	/** Pop/burst events for groups of cells that were cleared */
	popEvents: { frameIndex: number; cells: { x: number; y: number }[]; color: string }[];
	config: PBConfig;
}

export interface PBConfig extends BaseConfig {}
