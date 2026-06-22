import { BombermanStore, ExplosionModel, PlayerId, Position } from '../types';
import { GameState } from '../core/state';
import { GridPosition } from '../core/board';

export class Explosion implements ExplosionModel {
	static isActiveAt(store: BombermanStore, position: Position, ownerId?: PlayerId): boolean {
		return GameState.from(store).activeExplosionAt(position, ownerId);
	}

	constructor(
		public bombId: number,
		public ownerId: PlayerId,
		public x: number,
		public y: number,
		public blastRange: number,
		public affectedCells: Position[],
		public remainingFrames: number,
		public hitPlayerIds: PlayerId[]
	) {
		this.affectedCells = affectedCells.map((cell) => ({ ...cell }));
		this.hitPlayerIds = [...hitPlayerIds];
	}

	tick() {
		return --this.remainingFrames;
	}

	contains(position: Position) {
		const target = GridPosition.from(position);
		return this.affectedCells.some((cell) => target.equals(cell));
	}

	markPlayerHit(playerId: PlayerId) {
		if (!this.hitPlayerIds.includes(playerId)) {
			this.hitPlayerIds.push(playerId);
		}
	}
}
