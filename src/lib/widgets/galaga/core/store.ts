import type { GalagaConfig, GalagaStoreType } from '../types';

export const GalagaStore: GalagaStoreType = {
	frameCount: 0,
	nextBulletId: 0,
	contributions: [],
	ship: { x: 0 },
	bullets: [],
	grid: [],
	monthLabels: [],
	gameHistory: [],
	initialColors: [],
	cellEvents: [],
	explosionEvents: [],
	currentTargetCol: -1,
	framesShootingAtTarget: 0,
	framesAllowedForTarget: 4,
	config: undefined as unknown as GalagaConfig
};
