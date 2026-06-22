import { BaseConfig, BaseStore, Contribution, GridCell } from '../shared/types';

export type MinesweeperActionType = 'flag' | 'reveal' | 'explode';

export interface MinesweeperCell {
	x: number;
	y: number;
	isMine: boolean;
	adjacentMines: number;
	revealed: boolean;
	flagged: boolean;
	exploded: boolean;
	guessed: boolean;
	showMine?: boolean;
	highlightMine?: boolean;
	showNumber?: boolean;
}

export interface MinesweeperAction {
	frameIndex: number;
	type: MinesweeperActionType;
	x: number;
	y: number;
	adjacentMines: number;
	probability: number;
}

export interface MinesweeperSnapshot {
	board: MinesweeperCell[][];
	mouse: { x: number; y: number };
}

export interface MinesweeperConfig extends BaseConfig {}

export interface MinesweeperStore extends BaseStore {
	contributions: Contribution[];
	grid: GridCell[][];
	monthLabels: string[];
	config: MinesweeperConfig;
	gameInterval: number;
	frameCount: number;
	board: MinesweeperCell[][];
	actions: MinesweeperAction[];
	snapshots: MinesweeperSnapshot[];
	mouse: { x: number; y: number };
	totalMines: number;
	flagsPlaced: number;
	clearedSafeCells: number;
	explodedMines: number;
}
