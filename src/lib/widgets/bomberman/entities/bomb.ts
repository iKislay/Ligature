import { BombModel, BombermanStore, Direction, PlayerId, Position } from '../types';
import { BLAST_RANGE, BOMB_FUSE_FRAMES, BOMB_KICK_ROLL_INTERVAL_FRAMES, EXPLOSION_DURATION_FRAMES } from '../core/constants';
import { Explosion } from './explosion';
import { DIRECTION_VECTORS, DIRECTIONS, GridPosition, inBounds, isContributionCell, samePosition } from '../core/board';
import { Item } from './item';
import { GameState } from '../core/state';

export class BlastArea {
	static from(origin: Position, blastRange: number, isBlocked: (position: GridPosition) => boolean): BlastArea {
		const center = GridPosition.from(origin);
		const arms: Record<Direction, GridPosition[]> = {
			up: [],
			down: [],
			left: [],
			right: []
		};

		for (const vector of DIRECTION_VECTORS) {
			for (let distance = 1; distance <= blastRange; distance++) {
				const cell = center.translate(vector, distance);
				if (!cell.inBounds()) break;

				arms[vector.direction].push(cell);
				if (isBlocked(cell)) break;
			}
		}

		return new BlastArea(center, arms);
	}

	private constructor(
		public readonly origin: GridPosition,
		private readonly arms: Record<Direction, GridPosition[]>
	) {}

	cells(): GridPosition[] {
		return [this.origin, ...Object.values(this.arms).flat()];
	}

	plainCells(): Position[] {
		return this.cells().map((cell) => cell.toPlain());
	}

	armLength(direction: Direction) {
		return this.arms[direction].length;
	}

	endPosition(direction: Direction): GridPosition {
		return this.arms[direction][this.arms[direction].length - 1] ?? this.origin;
	}
}

export class Bomb implements BombModel {
	static findAt(store: BombermanStore, { x, y }: Position): BombModel | undefined {
		return GameState.from(store).findBombAt({ x, y });
	}

	static getBlastCells(store: BombermanStore, position: Position, blastRange = BLAST_RANGE): Position[] {
		const cells: Position[] = [position];

		for (const { x, y } of DIRECTIONS) {
			for (let distance = 1; distance <= blastRange; distance++) {
				const cell = { x: position.x + x * distance, y: position.y + y * distance };
				if (!inBounds(cell)) break;

				cells.push(cell);
				if (isContributionCell(store, cell)) break;
			}
		}

		return cells;
	}

	static getBlastArea(store: BombermanStore, position: Position, blastRange = BLAST_RANGE): BlastArea {
		return BlastArea.from(position, blastRange, (cell) => isContributionCell(store, cell));
	}

	static threateningAt(store: BombermanStore, position: Position, ownerId?: PlayerId): BombModel[] {
		return store.bombs.filter((bomb) => bomb.threatens(store, position, ownerId));
	}

	constructor(
		public id: number,
		public ownerId: PlayerId,
		public x: number,
		public y: number,
		public blastRange: number,
		public timer = BOMB_FUSE_FRAMES,
		public exploded = false,
		public kickDirection?: Direction,
		public kickMoveCooldown = 0
	) {}

	tick(store: BombermanStore) {
		if (!this.exploded) {
			this.advanceKick(store);
			this.timer--;
		}
		return this.timer;
	}

	getBlastCells(store: BombermanStore): Position[] {
		return Bomb.getBlastCells(store, this, this.blastRange);
	}

	getBlastArea(store: BombermanStore): BlastArea {
		return Bomb.getBlastArea(store, this, this.blastRange);
	}

	getKickLandingPosition(store: BombermanStore, direction: Direction): Position | null {
		const vector = DIRECTION_VECTORS.find((candidate) => candidate.direction === direction);
		if (!vector) return null;

		let landing: Position | null = null;
		for (let distance = 1; distance <= Math.max(store.grid.length, store.grid[0]?.length ?? 0); distance++) {
			const candidate = GridPosition.from(this).translate(vector, distance);
			if (!this.canOccupyKickCell(store, candidate)) break;

			landing = candidate.toPlain();
		}

		return landing;
	}

	canKick(store: BombermanStore, direction: Direction): boolean {
		return this.getKickLandingPosition(store, direction) !== null;
	}

	kick(store: BombermanStore, direction: Direction): boolean {
		const next = this.getKickNextPosition(store, direction);
		if (!next) return false;

		this.x = next.x;
		this.y = next.y;
		this.kickDirection = direction;
		this.kickMoveCooldown = BOMB_KICK_ROLL_INTERVAL_FRAMES;
		return true;
	}

	private advanceKick(store: BombermanStore) {
		if (!this.kickDirection) return;

		if (this.kickMoveCooldown > 0) {
			this.kickMoveCooldown--;
			if (this.kickMoveCooldown > 0) return;
		}

		const next = this.getKickNextPosition(store, this.kickDirection);
		if (!next) {
			this.kickDirection = undefined;
			this.kickMoveCooldown = 0;
			return;
		}

		this.x = next.x;
		this.y = next.y;
		this.kickMoveCooldown = BOMB_KICK_ROLL_INTERVAL_FRAMES;
	}

	private getKickNextPosition(store: BombermanStore, direction: Direction): Position | null {
		const vector = DIRECTION_VECTORS.find((candidate) => candidate.direction === direction);
		if (!vector) return null;

		const next = GridPosition.from(this).translate(vector);
		return this.canOccupyKickCell(store, next) ? next.toPlain() : null;
	}

	private canOccupyKickCell(store: BombermanStore, position: Position) {
		return (
			inBounds(position) &&
			!isContributionCell(store, position) &&
			!Bomb.findAt(store, position) &&
			!Explosion.isActiveAt(store, position)
		);
	}

	threatens(store: BombermanStore, position: Position, ownerId?: PlayerId): boolean {
		return (
			!this.exploded &&
			(ownerId === undefined || this.ownerId === ownerId) &&
			this.getBlastCells(store).some((cell) => samePosition(cell, position))
		);
	}

	wouldHitContribution(store: BombermanStore): boolean {
		return this.getBlastCells(store).some((cell) => isContributionCell(store, cell));
	}

	wouldHitVisibleItem(store: BombermanStore): boolean {
		return this.getBlastCells(store).some((cell) => Item.hasVisibleAt(store, cell));
	}

	wouldHitOpponent(store: BombermanStore): boolean {
		const opponent = GameState.from(store).aliveOpponentOf(this.ownerId);
		return Boolean(opponent && this.getBlastCells(store).some((cell) => samePosition(cell, opponent)));
	}

	wouldHitTarget(store: BombermanStore): boolean {
		return this.wouldHitContribution(store) || this.wouldHitOpponent(store);
	}

	explode(store: BombermanStore) {
		if (this.exploded) return;

		this.exploded = true;
		const affectedCells = this.getBlastCells(store);

		this.applyBlastToCells(store, affectedCells);
		const hitPlayerIds = this.killPlayersInBlast(store, affectedCells);
		this.recordExplosion(store, affectedCells, hitPlayerIds);
	}

	private applyBlastToCells(store: BombermanStore, affectedCells: Position[]) {
		for (const position of affectedCells) {
			if (isContributionCell(store, position)) {
				this.destroyContributionCell(store, position);
			} else {
				Item.destroyVisibleAt(store, position);
			}

			const chainedBomb = Bomb.findAt(store, position);
			if (chainedBomb) chainedBomb.explode(store);
		}
	}

	private destroyContributionCell(store: BombermanStore, position: Position) {
		if (!isContributionCell(store, position)) return false;

		const gameState = GameState.from(store);
		const color = gameState.clearContributionCell(position);
		const owner = store.players.find((player) => player.id === this.ownerId);
		if (owner) owner.markCellDestroyed();
		Item.revealAt(store, position);

		gameState.recordCellDestroyed(position, color);

		return true;
	}

	private killPlayersInBlast(store: BombermanStore, affectedCells: Position[]) {
		const hitPlayerIds: PlayerId[] = [];
		for (const player of store.players) {
			if (!player.alive) continue;
			if (!affectedCells.some((position) => position.x === player.x && position.y === player.y)) continue;

			player.kill();
			hitPlayerIds.push(player.id);
		}

		return hitPlayerIds;
	}

	private recordExplosion(store: BombermanStore, affectedCells: Position[], hitPlayerIds: PlayerId[]) {
		const explosion = new Explosion(
			this.id,
			this.ownerId,
			this.x,
			this.y,
			this.blastRange,
			affectedCells,
			EXPLOSION_DURATION_FRAMES,
			hitPlayerIds
		);

		GameState.from(store).addExplosion(explosion);
	}
}
