import { BaseConfig, BaseStore } from '../shared/types';

export interface GalagaShip {
	/** Center x position in grid units */
	x: number;
}

export interface GalagaBullet {
	/** Unique id so flights can be tracked across frames */
	id: number;
	/** Column center x in grid units (constant per bullet) */
	x: number;
	/** Continuous y position in grid units (decreases as bullet travels up) */
	y: number;
	active: boolean;
}

export interface GalagaStoreType extends BaseStore {
	frameCount: number;
	nextBulletId: number;
	ship: GalagaShip;
	bullets: GalagaBullet[];
	/** Per-frame ship + bullet snapshots */
	gameHistory: { ship: GalagaShip; bullets: GalagaBullet[] }[];
	/** Initial cell colors before any enemies are destroyed [col][row] */
	initialColors: string[][];
	/** Ordered list of cell color-change events keyed by gameHistory frame index */
	cellEvents: { frameIndex: number; x: number; y: number; color: string }[];
	/** Explosion events when a cell is fully destroyed */
	explosionEvents: { frameIndex: number; x: number; y: number; color: string }[];
	/** Currently locked-on column index */
	currentTargetCol: number;
	/** How many frames the ship has been shooting at the current target */
	framesShootingAtTarget: number;
	/** How many frames the ship will spend on the current target before moving on */
	framesAllowedForTarget: number;
	config: GalagaConfig;
}

export interface GalagaConfig extends BaseConfig {
	// No additional options beyond BaseConfig for now
}
