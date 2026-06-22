import type { BreakoutConfig, BreakoutStoreType } from '../types';

export const BreakoutStore: BreakoutStoreType = {
	frameCount: 0,
	contributions: [],
	ball: { x: 0, y: 0, dx: 0, dy: 0 },
	paddle: { x: 0, width: 7 },
	grid: [],
	monthLabels: [],
	framesSinceLastBrickHit: 0,
	targetBrick: null,
	bouncesSinceTargetSet: 0,
	gameHistory: [],
	initialColors: [],
	brickEvents: [],
	config: undefined as unknown as BreakoutConfig
};
