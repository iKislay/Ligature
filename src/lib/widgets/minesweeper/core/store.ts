import { MinesweeperConfig, MinesweeperStore } from '../types';

export const Store: MinesweeperStore = {
	contributions: [],
	grid: [],
	monthLabels: [],
	config: undefined as unknown as MinesweeperConfig,
	gameInterval: 0,
	frameCount: 0,
	board: [],
	actions: [],
	snapshots: [],
	mouse: { x: 0, y: 0 },
	totalMines: 0,
	flagsPlaced: 0,
	clearedSafeCells: 0,
	explodedMines: 0
};
