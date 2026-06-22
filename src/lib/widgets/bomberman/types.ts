import { BaseConfig, BaseStore, Contribution, GridCell } from '../shared/types';

export interface BombermanStore extends BaseStore {
	frameCount: number;
	gameInterval: number;
	nextBombId: number;
	nextItemId: number;
	players: PlayerModel[];
	bombs: BombModel[];
	activeExplosions: ExplosionModel[];
	items: ItemModel[];
	gameHistory: Snapshot[];
	initialColors: string[][];
	cellEvents: CellEvent[];
	explosionEvents: ExplosionEvent[];
	contributions: Contribution[];
	grid: GridCell[][];
	monthLabels: string[];
	config: BombermanConfig;
}

export interface BombermanConfig extends BaseConfig {}

export type PlayerId = 1 | 2;
export type Direction = 'up' | 'down' | 'left' | 'right';
export type AttackSide = 'left' | 'right';
export type RoutePreference = 'horizontal-first' | 'vertical-first';
export type ItemType = 'blast-range' | 'speed' | 'bomb-capacity' | 'bomb-kick';

export interface Position {
	x: number;
	y: number;
}

export interface PlayerState extends Position {
	id: PlayerId;
	name: string;
	alive: boolean;
	direction: Direction;
	bombsPlaced: number;
	cellsDestroyed: number;
	blastRangeBonus: number;
	bombCapacityBonus?: number;
	speedBonus?: number;
	movementStepProgress?: number;
	attackSide?: AttackSide;
	routePreference?: RoutePreference;
	canKickBombs?: boolean;
}

export interface PlayerModel extends PlayerState {
	readonly blastRange: number;
	readonly bombLimit: number;
	readonly previewBomb: BombModel;
	nextMoveCount(): number;
	moveTo(next: Position, direction?: Direction): void;
	kill(): void;
	markBombPlaced(): void;
	markCellDestroyed(): void;
	increaseBlastRange(amount?: number): void;
	increaseBombCapacity(amount?: number): void;
	increaseSpeed(amount: number): void;
	enableBombKick(): void;
	canPlaceBomb(store: BombermanStore): boolean;
	placeBomb(store: BombermanStore): void;
	kickBomb(store: BombermanStore, bomb: BombModel, direction: Direction): boolean;
	isInOwnFutureBlast(store: BombermanStore, position: Position): boolean;
	isOwnExplosionDangerCell(store: BombermanStore, position: Position): boolean;
	isSafeStandingCell(store: BombermanStore, position: Position): boolean;
	bombWouldHitOpponent(store: BombermanStore): boolean;
	bombWouldHitTarget(store: BombermanStore): boolean;
}

export interface BombState extends Position {
	id: number;
	ownerId: PlayerId;
	timer: number;
	exploded: boolean;
	blastRange: number;
	kickDirection?: Direction;
	kickMoveCooldown?: number;
}

export interface BombModel extends BombState {
	tick(store: BombermanStore): number;
	getBlastCells(store: BombermanStore): Position[];
	getKickLandingPosition(store: BombermanStore, direction: Direction): Position | null;
	canKick(store: BombermanStore, direction: Direction): boolean;
	kick(store: BombermanStore, direction: Direction): boolean;
	threatens(store: BombermanStore, position: Position, ownerId?: PlayerId): boolean;
	wouldHitContribution(store: BombermanStore): boolean;
	wouldHitVisibleItem(store: BombermanStore): boolean;
	wouldHitOpponent(store: BombermanStore): boolean;
	wouldHitTarget(store: BombermanStore): boolean;
	explode(store: BombermanStore): void;
}

export interface ExplosionState {
	bombId: number;
	ownerId: PlayerId;
	x: number;
	y: number;
	blastRange: number;
	remainingFrames: number;
	affectedCells: Position[];
	hitPlayerIds: PlayerId[];
}

export interface ExplosionModel extends ExplosionState {
	tick(): number;
	contains(position: Position): boolean;
	markPlayerHit(playerId: PlayerId): void;
}

export interface ItemState extends Position {
	id: number;
	type: ItemType;
	hidden: boolean;
	collected: boolean;
	destroyed: boolean;
}

export interface ItemModel extends ItemState {
	readonly visible: boolean;
	reveal(): boolean;
	collectBy(player: PlayerModel): boolean;
	collect(): boolean;
	destroy(): boolean;
}

export interface CellEvent extends Position {
	frameIndex: number;
	color: string;
}

export interface ExplosionEvent extends ExplosionState {
	frameIndex: number;
}

export interface Snapshot {
	players: PlayerState[];
	bombs: BombState[];
	explosions: ExplosionState[];
	items: ItemState[];
}
