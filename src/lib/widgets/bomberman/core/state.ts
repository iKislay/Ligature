import { Utils } from '../../shared/utils/utils';
import { BombModel, BombermanStore, ExplosionModel, PlayerId, Position } from '../types';
import { GridPosition } from './board';

export class GameState {
	static from(store: BombermanStore) {
		return new GameState(store);
	}

	private constructor(private readonly store: BombermanStore) {}

	reset() {
		this.store.frameCount = 0;
		this.store.nextBombId = 0;
		this.store.nextItemId = 0;
		this.store.players = [];
		this.store.bombs = [];
		this.store.activeExplosions = [];
		this.store.items = [];
		this.store.gameHistory = [];
		this.store.cellEvents = [];
		this.store.explosionEvents = [];
	}

	nextBombId() {
		return this.store.nextBombId++;
	}

	nextItemId() {
		return this.store.nextItemId++;
	}

	addBomb(bomb: BombModel) {
		this.store.bombs.push(bomb);
	}

	addExplosion(explosion: ExplosionModel) {
		this.store.activeExplosions.push(explosion);
		this.store.explosionEvents.push({
			frameIndex: this.store.gameHistory.length,
			...explosion
		});
	}

	activeBombsOwnedBy(ownerId: PlayerId) {
		return this.store.bombs.filter((bomb) => !bomb.exploded && bomb.ownerId === ownerId);
	}

	findBombAt(position: Position): BombModel | undefined {
		const target = GridPosition.from(position);
		return this.store.bombs.find((bomb) => !bomb.exploded && target.equals(bomb));
	}

	activeExplosionAt(position: Position, ownerId?: PlayerId) {
		return this.store.activeExplosions.some(
			(explosion) => (ownerId === undefined || explosion.ownerId === ownerId) && explosion.contains(position)
		);
	}

	aliveOpponentOf(playerId: PlayerId) {
		return this.store.players.find((candidate) => candidate.id !== playerId && candidate.alive);
	}

	clearContributionCell(position: Position) {
		const target = GridPosition.from(position);
		const theme = Utils.getCurrentTheme(this.store);
		this.store.grid[target.x][target.y] = {
			commitsCount: 0,
			level: 'NONE',
			color: theme.intensityColors[0]
		};
		return theme.intensityColors[0];
	}

	recordCellDestroyed(position: Position, color: string) {
		const target = GridPosition.from(position);
		this.store.cellEvents.push({
			frameIndex: this.store.gameHistory.length,
			x: target.x,
			y: target.y,
			color
		});
		this.store.config.pointsIncreasedCallback(this.store.cellEvents.length);
	}
}
