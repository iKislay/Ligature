import { Direction, Position, BombermanStore } from '../types';
import { GRID_HEIGHT, GRID_WIDTH } from './constants';

export type DirectionVector = Position & { direction: Direction };

type DirectionDelta = {
	readonly dx: number;
	readonly dy: number;
	readonly direction: Direction;
};

export const DIRECTION_VECTORS: readonly DirectionDelta[] = [
	{ dx: 0, dy: -1, direction: 'up' },
	{ dx: 0, dy: 1, direction: 'down' },
	{ dx: -1, dy: 0, direction: 'left' },
	{ dx: 1, dy: 0, direction: 'right' }
];

export const DIRECTIONS: DirectionVector[] = DIRECTION_VECTORS.map(({ dx, dy, direction }) => ({ x: dx, y: dy, direction }));

export class GridPosition implements Position {
	static from(position: Position): GridPosition {
		return position instanceof GridPosition ? position : new GridPosition(position.x, position.y);
	}

	constructor(
		public readonly x: number,
		public readonly y: number
	) {}

	key() {
		return `${this.x}:${this.y}`;
	}

	equals(other: Position) {
		return this.x === other.x && this.y === other.y;
	}

	manhattanTo(other: Position) {
		return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
	}

	translate(vector: DirectionDelta, distance = 1) {
		return new GridPosition(this.x + vector.dx * distance, this.y + vector.dy * distance);
	}

	inBounds() {
		return this.x >= 0 && this.x < GRID_WIDTH && this.y >= 0 && this.y < GRID_HEIGHT;
	}

	adjacent(): (Position & { direction: Direction })[] {
		return DIRECTION_VECTORS.map((vector) => ({
			...this.translate(vector).toPlain(),
			direction: vector.direction
		})).filter((position) => GridPosition.from(position).inBounds());
	}

	toPlain(): Position {
		return { x: this.x, y: this.y };
	}
}

export const positionKey = (position: Position) => GridPosition.from(position).key();

export const samePosition = (a: Position, b: Position) => GridPosition.from(a).equals(b);

export const manhattan = (a: Position, b: Position) => GridPosition.from(a).manhattanTo(b);

export const inBounds = (position: Position) => GridPosition.from(position).inBounds();

export const isContributionCell = (store: BombermanStore, { x, y }: Position) => inBounds({ x, y }) && store.grid[x][y].commitsCount > 0;

export const isEmptyCell = (store: BombermanStore, { x, y }: Position) => inBounds({ x, y }) && store.grid[x][y].commitsCount === 0;

export const isPassableCell = (store: BombermanStore, position: Position) =>
	isEmptyCell(store, position) &&
	!store.bombs.some((bomb) => !bomb.exploded && samePosition(bomb, position)) &&
	!store.activeExplosions.some((explosion) => explosion.contains(position));

export const getAdjacentPositions = (position: Position): (Position & { direction: Direction })[] =>
	GridPosition.from(position)
		.adjacent()
		.map((next) => ({ x: next.x, y: next.y, direction: next.direction }));
