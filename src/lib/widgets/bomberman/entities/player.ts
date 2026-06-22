import { AttackSide, BombModel, BombermanStore, Direction, PlayerId, PlayerModel, PlayerState, Position, RoutePreference } from '../types';
import { BLAST_RANGE, BOMB_FUSE_FRAMES, BOMB_LIMIT, GRID_HEIGHT, GRID_WIDTH, PLAYER_SPEED_UNITS } from '../core/constants';
import { Bomb } from './bomb';
import { Explosion } from './explosion';
import { DIRECTIONS, inBounds, isContributionCell, isEmptyCell } from '../core/board';
import { GameState } from '../core/state';

export const placePlayers = (store: BombermanStore) => {
	const playerOneStart = { x: 0, y: 0 };
	const playerTwoStart = { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 };

	store.players = [createPlayer(1, 'Bomberman', playerOneStart, 'right'), createPlayer(2, 'Plunder Bomber', playerTwoStart, 'left')];
};

export const clearPlayerSpawnAreas = (store: BombermanStore) => {
	clearSpawnArea(store, { x: 0, y: 0 });
	clearSpawnArea(store, { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 });
};

const clearSpawnArea = (store: BombermanStore, topLeft: Position) => {
	for (let x = topLeft.x; x < topLeft.x + 2; x++) {
		for (let y = topLeft.y; y < topLeft.y + 2; y++) {
			const position = { x, y };
			if (inBounds(position)) clearSpawnContributionCell(store, position);
		}
	}
};

const clearSpawnContributionCell = (store: BombermanStore, position: Position) => {
	if (!isContributionCell(store, position)) return false;

	GameState.from(store).clearContributionCell(position);
	return true;
};

const createPlayer = (id: PlayerModel['id'], name: string, position: Position, direction: PlayerModel['direction']): PlayerModel =>
	new Player(id, name, position.x, position.y, direction, true, 0, 0, 0, 0, 0, 0, randomAttackSide(), randomRoutePreference());

const randomAttackSide = (): AttackSide => (Math.random() < 0.5 ? 'left' : 'right');

const randomRoutePreference = (): RoutePreference => (Math.random() < 0.5 ? 'horizontal-first' : 'vertical-first');

export class Player implements PlayerModel {
	static fromState(state: PlayerState): Player {
		return new Player(
			state.id,
			state.name,
			state.x,
			state.y,
			state.direction,
			state.alive,
			state.bombsPlaced,
			state.cellsDestroyed,
			state.blastRangeBonus,
			state.bombCapacityBonus ?? 0,
			state.speedBonus ?? 0,
			state.movementStepProgress ?? 0,
			state.attackSide,
			state.routePreference,
			state.canKickBombs ?? false
		);
	}

	constructor(
		public id: PlayerId,
		public name: string,
		public x: number,
		public y: number,
		public direction: Direction,
		public alive = true,
		public bombsPlaced = 0,
		public cellsDestroyed = 0,
		public blastRangeBonus = 0,
		public bombCapacityBonus = 0,
		public speedBonus = 0,
		public movementStepProgress = 0,
		public attackSide?: AttackSide,
		public routePreference?: RoutePreference,
		public canKickBombs = false
	) {}

	get blastRange() {
		return BLAST_RANGE + this.blastRangeBonus;
	}

	get bombLimit() {
		return BOMB_LIMIT + this.bombCapacityBonus;
	}

	get previewBomb() {
		return new Bomb(-1, this.id, this.x, this.y, this.blastRange, BOMB_FUSE_FRAMES, false);
	}

	nextMoveCount() {
		const speedUnits = PLAYER_SPEED_UNITS + this.speedBonus;
		const progress = this.movementStepProgress + speedUnits;
		const moveCount = Math.floor(progress / PLAYER_SPEED_UNITS);

		this.movementStepProgress = progress % PLAYER_SPEED_UNITS;
		return Math.max(1, moveCount);
	}

	moveTo(next: Position, direction?: Direction) {
		if (direction) this.direction = direction;
		this.x = next.x;
		this.y = next.y;
	}

	kill() {
		this.alive = false;
	}

	markBombPlaced() {
		this.bombsPlaced++;
	}

	markCellDestroyed() {
		this.cellsDestroyed++;
	}

	increaseBlastRange(amount = 1) {
		this.blastRangeBonus += amount;
	}

	increaseBombCapacity(amount = 1) {
		this.bombCapacityBonus += amount;
	}

	increaseSpeed(amount: number) {
		this.speedBonus += amount;
	}

	enableBombKick() {
		this.canKickBombs = true;
	}

	canPlaceBomb(store: BombermanStore): boolean {
		const gameState = GameState.from(store);
		return (
			this.alive &&
			isEmptyCell(store, this) &&
			!gameState.findBombAt(this) &&
			gameState.activeBombsOwnedBy(this.id).length < this.bombLimit
		);
	}

	placeBomb(store: BombermanStore) {
		if (!this.canPlaceBomb(store)) return;

		const gameState = GameState.from(store);
		const bomb = new Bomb(gameState.nextBombId(), this.id, this.x, this.y, this.blastRange, BOMB_FUSE_FRAMES, false);
		gameState.addBomb(bomb);
		this.markBombPlaced();
	}

	kickBomb(store: BombermanStore, bomb: BombModel, direction: Direction) {
		if (!this.canKickBombs) return false;
		if (!this.isBombInKickDirection(bomb, direction)) return false;
		return bomb.kick(store, direction);
	}

	private isBombInKickDirection(bomb: BombModel, direction: Direction) {
		const vector = DIRECTIONS.find((candidate) => candidate.direction === direction);
		return Boolean(vector && bomb.x === this.x + vector.x && bomb.y === this.y + vector.y);
	}

	isInOwnFutureBlast(store: BombermanStore, position: Position): boolean {
		return Bomb.threateningAt(store, position, this.id).length > 0;
	}

	isOwnExplosionDangerCell(store: BombermanStore, position: Position): boolean {
		return Explosion.isActiveAt(store, position, this.id) || this.isInOwnFutureBlast(store, position);
	}

	isSafeStandingCell(store: BombermanStore, position: Position): boolean {
		return (
			isEmptyCell(store, position) &&
			!Bomb.findAt(store, position) &&
			!Explosion.isActiveAt(store, position) &&
			!this.isInOwnFutureBlast(store, position)
		);
	}

	bombWouldHitOpponent(store: BombermanStore): boolean {
		return this.previewBomb.wouldHitOpponent(store);
	}

	bombWouldHitTarget(store: BombermanStore): boolean {
		return this.previewBomb.wouldHitTarget(store);
	}
}
