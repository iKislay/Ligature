import type { PBConfig, PBStoreType } from '../types';

export const PuzzleBobbleStore: PBStoreType = {
	frameCount: 0,
	nextBubbleId: 0,
	nextBubbleColorIndex: 0,
	currentBubbleColorIndex: 0,
	cannonTargetAngle: -1,
	contributions: [],
	cannon: { angleDeg: 90 },
	activeBubble: null,
	grid: [],
	monthLabels: [],
	gameHistory: [],
	initialColors: [],
	cellBubbleColors: [],
	cellEvents: [],
	popEvents: [],
	config: undefined as unknown as PBConfig
};
