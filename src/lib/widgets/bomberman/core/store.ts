import type { BombermanConfig, BombermanStore } from '../types';

export const storeTemplate: BombermanStore = {
	frameCount: 0,
	contributions: [],
	grid: [],
	monthLabels: [],
	gameInterval: 0,
	nextBombId: 0,
	nextItemId: 0,
	players: [],
	bombs: [],
	activeExplosions: [],
	items: [],
	gameHistory: [],
	initialColors: [],
	cellEvents: [],
	explosionEvents: [],
	config: undefined as unknown as BombermanConfig
};
