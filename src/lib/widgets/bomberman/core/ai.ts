import { BombModel, Direction, PlayerModel, Position, BombermanStore } from '../types';
import { DIRECTIONS, getAdjacentPositions, isContributionCell, isPassableCell, manhattan, positionKey, samePosition } from './board';
import {
	canEscapeAfterPlantingBomb,
	canEscapeAfterPlantingBombAt,
	estimateFastestRoute,
	findEscapeStep,
	findPathToTarget,
	findReachableBombOrigins,
	getPreviousPlayerPosition,
	isBacktrackingStep,
	sortPathOptions,
	RouteStep,
	EstimatedRoute
} from './pathfinding';
import { AI_SCORE, ITEM_DROP_CHANCE_BY_LEVEL, PATH_BLAST_COST } from './constants';
import { Bomb } from '../entities/bomb';
import { Item } from '../entities/item';
import { Player } from '../entities/player';

type BombSpot = { position: Position; firstStep: Position | null; contribution: Position; score: number };

type BombSpotScoreContext = {
	origin: RouteStep & { position: Position };
	routeAfterBomb: EstimatedRoute;
	opponent: PlayerModel;
	contributions: Position[];
	routeImprovement: number;
	isBacktrack: boolean;
};

interface BombSpotScorer {
	score(context: BombSpotScoreContext): number;
}

class WeightedBombSpotScorer implements BombSpotScorer {
	score({ origin, routeAfterBomb, opponent, contributions, routeImprovement, isBacktrack }: BombSpotScoreContext) {
		const backtrackPenalty = isBacktrack ? AI_SCORE.BACKTRACK_PENALTY : 0;
		return (
			routeAfterBomb.blastedCells * PATH_BLAST_COST * AI_SCORE.BLASTED_CELL_WEIGHT +
			origin.distance * AI_SCORE.ORIGIN_DISTANCE_WEIGHT +
			routeAfterBomb.distance +
			manhattan(origin.position, opponent) * AI_SCORE.OPPONENT_DISTANCE_WEIGHT +
			backtrackPenalty -
			contributions.length * AI_SCORE.CONTRIBUTION_COUNT_REWARD -
			routeImprovement * AI_SCORE.ROUTE_IMPROVEMENT_REWARD
		);
	}
}

type MovementDecision = {
	handled: boolean;
	step: Position | null;
};

type MovementContext = {
	store: BombermanStore;
	player: PlayerModel;
	opponent: PlayerModel | null;
	bombSpotPlanner: BombSpotPlanner;
};

interface MovementStrategy {
	choose(context: MovementContext): MovementDecision | null;
}

class EscapeMovementStrategy implements MovementStrategy {
	choose({ store, player }: MovementContext): MovementDecision | null {
		const mustEscape = Boolean(Bomb.findAt(store, player)) || player.isOwnExplosionDangerCell(store, player);
		if (!mustEscape) return null;
		return { handled: true, step: findEscapeStep(store, player) };
	}
}

class ItemMovementStrategy implements MovementStrategy {
	choose({ store, player, opponent }: MovementContext): MovementDecision | null {
		if (player.canKickBombs) return null;
		if (!opponent) return { handled: true, step: null };
		const previousPosition = getPreviousPlayerPosition(store, player.id);
		const itemRoute = findPathToTarget(store, player, (position) => Item.hasVisibleAt(store, position), {
			avoidFirstStep: previousPosition,
			attackSide: player.attackSide,
			routePreference: player.routePreference
		});
		const step = toSafeStep(store, player, itemRoute?.firstStep ?? null);
		return step ? { handled: true, step } : null;
	}
}

class ChaseOpponentMovementStrategy implements MovementStrategy {
	choose({ store, player, opponent }: MovementContext): MovementDecision | null {
		if (!opponent) return { handled: true, step: null };
		const previousPosition = getPreviousPlayerPosition(store, player.id);
		const directRoute = findPathToTarget(store, player, (position) => samePosition(position, opponent), {
			avoidFirstStep: previousPosition,
			attackSide: player.attackSide,
			routePreference: player.routePreference,
			target: opponent
		});
		const step = toSafeStep(store, player, directRoute?.firstStep ?? null);
		return step ? { handled: true, step } : null;
	}
}

class RouteItemHuntMovementStrategy implements MovementStrategy {
	choose({ store, player, opponent, bombSpotPlanner }: MovementContext): MovementDecision | null {
		if (!opponent || !player.canPlaceBomb(store)) return null;

		const next = bombSpotPlanner.findBestItemHuntToward(opponent)?.firstStep ?? null;
		return next ? { handled: true, step: toSafeStep(store, player, next) } : null;
	}
}

class BombKickMovementStrategy implements MovementStrategy {
	choose({ store, player, opponent }: MovementContext): MovementDecision | null {
		if (!player.canKickBombs || !opponent) return null;

		const kickStep = findKickStepToward(store, player, opponent);
		return kickStep ? { handled: true, step: kickStep } : null;
	}
}

class BombSpotMovementStrategy implements MovementStrategy {
	choose({ store, player, opponent, bombSpotPlanner }: MovementContext): MovementDecision | null {
		if (!opponent || !player.canPlaceBomb(store)) return { handled: true, step: null };
		const next = bombSpotPlanner.findBestToward(opponent)?.firstStep ?? null;
		return { handled: true, step: toSafeStep(store, player, next) };
	}
}

class BombSpotPlanner {
	constructor(
		private readonly store: BombermanStore,
		private readonly player: PlayerModel,
		private readonly bombSpotScorer: BombSpotScorer = new WeightedBombSpotScorer()
	) {}

	findBestToward(opponent: PlayerModel): BombSpot | null {
		const currentRoute = estimateFastestRoute(this.store, this.player, opponent);
		const origins = findReachableBombOrigins(this.store, this.player);
		const candidates: BombSpot[] = [];

		for (const origin of origins) {
			if (!canEscapeAfterPlantingBombAt(this.store, this.player, origin.position)) continue;

			const previewBomb = new Bomb(-1, this.player.id, origin.position.x, origin.position.y, this.player.blastRange);
			if (previewBomb.wouldHitVisibleItem(this.store)) continue;

			const contributions = previewBomb.getBlastCells(this.store).filter((p) => isContributionCell(this.store, p));
			if (contributions.length === 0) continue;

			const openedCells = new Set(contributions.map(positionKey));
			const routeAfterBomb = estimateFastestRoute(this.store, origin.position, opponent, openedCells);
			if (!routeAfterBomb) continue;

			const routeImprovement = currentRoute ? currentRoute.cost - routeAfterBomb.cost : PATH_BLAST_COST;
			if (routeImprovement <= 0) continue;

			const bestContribution = contributions.sort((a, b) => manhattan(a, opponent) - manhattan(b, opponent))[0];
			const score = this.bombSpotScorer.score({
				origin,
				routeAfterBomb,
				opponent,
				contributions,
				routeImprovement,
				isBacktrack: Boolean(origin.firstStep && isBacktrackingStep(this.store, this.player, origin.firstStep))
			});

			candidates.push({ position: origin.position, firstStep: origin.firstStep, contribution: bestContribution, score });
		}

		if (candidates.length === 0) return null;
		return candidates.sort((a, b) => a.score - b.score || a.position.x - b.position.x || a.position.y - b.position.y)[0];
	}

	findBestItemHuntToward(opponent: PlayerModel): BombSpot | null {
		const directPath = findDirectPath(this.store, this.player, opponent);
		if (!directPath) return null;

		const origins = findReachableBombOrigins(this.store, this.player);
		const candidates: BombSpot[] = [];

		for (const origin of origins) {
			if (!canEscapeAfterPlantingBombAt(this.store, this.player, origin.position)) continue;

			const previewBomb = new Bomb(-1, this.player.id, origin.position.x, origin.position.y, this.player.blastRange);
			if (previewBomb.wouldHitVisibleItem(this.store)) continue;

			const contributions = previewBomb.getBlastCells(this.store).filter((position) => isContributionCell(this.store, position));
			if (contributions.length === 0) continue;

			const bestContribution = contributions
				.map((contribution) => ({
					contribution,
					itemDropChance: getItemDropChance(this.store, contribution),
					pathDistance: minDistanceToPath(contribution, directPath)
				}))
				.sort(
					(a, b) =>
						a.pathDistance - b.pathDistance ||
						b.itemDropChance - a.itemDropChance ||
						manhattan(a.contribution, opponent) - manhattan(b.contribution, opponent) ||
						manhattan(a.contribution, this.player) - manhattan(b.contribution, this.player)
				)[0];
			if (!bestContribution || bestContribution.pathDistance > 1) continue;

			const expectedItemDropChance = contributions.reduce(
				(sum, contribution) => sum + getItemDropChance(this.store, contribution),
				0
			);
			const score =
				origin.distance * AI_SCORE.ORIGIN_DISTANCE_WEIGHT +
				bestContribution.pathDistance * PATH_BLAST_COST +
				manhattan(bestContribution.contribution, opponent) * AI_SCORE.OPPONENT_DISTANCE_WEIGHT -
				contributions.length * AI_SCORE.CONTRIBUTION_COUNT_REWARD -
				expectedItemDropChance * AI_SCORE.ITEM_DROP_CHANCE_REWARD;

			candidates.push({
				position: origin.position,
				firstStep: origin.firstStep,
				contribution: bestContribution.contribution,
				score
			});
		}

		if (candidates.length === 0) return null;
		return candidates.sort((a, b) => a.score - b.score || a.position.x - b.position.x || a.position.y - b.position.y)[0];
	}
}

const toSafeStep = (store: BombermanStore, player: PlayerModel, next: Position | null) => {
	if (!next || !isPassableCell(store, next) || player.isOwnExplosionDangerCell(store, next)) return null;
	return next;
};

const findDirectPath = (store: BombermanStore, start: PlayerModel, target: Position): Position[] | null => {
	const startKey = positionKey(start);
	const visited = new Set([startKey]);
	const previousByKey = new Map<string, string | null>([[startKey, null]]);
	const positionsByKey = new Map<string, Position>([[startKey, { x: start.x, y: start.y }]]);
	const queue: Position[] = [{ x: start.x, y: start.y }];
	let queueHead = 0;

	while (queueHead < queue.length) {
		const current = queue[queueHead++];
		if (current !== start && samePosition(current, target)) return reconstructPath(positionKey(current), previousByKey, positionsByKey);

		const nextPositions = sortPathOptions(getAdjacentPositions(current), {
			attackSide: start.attackSide,
			origin: current,
			routePreference: start.routePreference,
			target
		});

		for (const next of nextPositions) {
			const key = positionKey(next);
			if (visited.has(key) || !isPassableCell(store, next)) continue;

			visited.add(key);
			previousByKey.set(key, positionKey(current));
			positionsByKey.set(key, { x: next.x, y: next.y });
			queue.push({ x: next.x, y: next.y });
		}
	}

	return null;
};

const reconstructPath = (endKey: string, previousByKey: Map<string, string | null>, positionsByKey: Map<string, Position>) => {
	const path: Position[] = [];
	let key: string | null = endKey;

	while (key) {
		const position = positionsByKey.get(key);
		if (position) path.push(position);
		key = previousByKey.get(key) ?? null;
	}

	return path.reverse();
};

const minDistanceToPath = (position: Position, path: Position[]) =>
	path.reduce((best, pathPosition) => Math.min(best, manhattan(position, pathPosition)), Number.POSITIVE_INFINITY);

const getItemDropChance = (store: BombermanStore, position: Position) => {
	const cell = store.grid[position.x]?.[position.y];
	return cell ? ITEM_DROP_CHANCE_BY_LEVEL[cell.level] : 0;
};

const findKickStepToward = (store: BombermanStore, player: PlayerModel, target: Position): Position | null => {
	const nextPositions = sortPathOptions(getAdjacentPositions(player), {
		attackSide: player.attackSide,
		origin: player,
		routePreference: player.routePreference,
		target
	});

	for (const next of nextPositions) {
		const direction = DIRECTIONS.find((delta) => player.x + delta.x === next.x && player.y + delta.y === next.y)?.direction;
		const bomb = Bomb.findAt(store, next);
		if (!direction || !bomb) continue;

		const kickedBomb = previewKickedBomb(store, bomb, direction);
		if (!kickedBomb || kickedBomb.threatens(store, next)) continue;
		if (!canPlayerEscapeAfterKick(store, player, bomb, direction, next)) continue;

		return { x: next.x, y: next.y };
	}

	return null;
};

const previewKickedBomb = (store: BombermanStore, bomb: BombModel, direction: Direction): Bomb | null => {
	const landing = bomb.getKickLandingPosition(store, direction);
	if (!landing) return null;

	return new Bomb(
		bomb.id,
		bomb.ownerId,
		landing.x,
		landing.y,
		bomb.blastRange,
		bomb.timer,
		bomb.exploded,
		direction,
		bomb.kickMoveCooldown
	);
};

const previewImmediateKickedBomb = (store: BombermanStore, bomb: BombModel, direction: Direction): Bomb | null => {
	if (!bomb.canKick(store, direction)) return null;

	const delta = DIRECTIONS.find((candidate) => candidate.direction === direction);
	if (!delta) return null;

	return new Bomb(
		bomb.id,
		bomb.ownerId,
		bomb.x + delta.x,
		bomb.y + delta.y,
		bomb.blastRange,
		bomb.timer,
		bomb.exploded,
		direction,
		bomb.kickMoveCooldown
	);
};

const canPlayerEscapeAfterKick = (
	store: BombermanStore,
	player: PlayerModel,
	bomb: BombModel,
	direction: Direction,
	playerPositionAfterKick: Position
) => {
	const immediateBomb = previewImmediateKickedBomb(store, bomb, direction);
	const landingBomb = previewKickedBomb(store, bomb, direction);
	if (!immediateBomb || !landingBomb) return false;

	return (
		canPlayerEscapeWithVirtualBomb(store, player, bomb, immediateBomb, playerPositionAfterKick) &&
		canPlayerEscapeWithVirtualBomb(store, player, bomb, landingBomb, playerPositionAfterKick)
	);
};

const canPlayerEscapeWithVirtualBomb = (
	store: BombermanStore,
	player: PlayerModel,
	sourceBomb: BombModel,
	virtualBomb: BombModel,
	playerPosition: Position
) => {
	const virtualPlayer = Player.fromState({ ...player, x: playerPosition.x, y: playerPosition.y });
	const sourceIndex = store.bombs.indexOf(sourceBomb);

	if (sourceIndex >= 0) {
		store.bombs[sourceIndex] = virtualBomb;
	} else {
		store.bombs.push(virtualBomb);
	}

	try {
		return virtualPlayer.isSafeStandingCell(store, playerPosition) || Boolean(findEscapeStep(store, virtualPlayer));
	} finally {
		if (sourceIndex >= 0) {
			store.bombs[sourceIndex] = sourceBomb;
		} else {
			store.bombs.pop();
		}
	}
};

export class AiController {
	private readonly bombSpotPlanner: BombSpotPlanner;
	private readonly movementStrategies: MovementStrategy[];

	constructor(
		private readonly store: BombermanStore,
		private readonly player: PlayerModel,
		bombSpotScorer: BombSpotScorer = new WeightedBombSpotScorer()
	) {
		this.bombSpotPlanner = new BombSpotPlanner(store, player, bombSpotScorer);
		this.movementStrategies = [
			new BombKickMovementStrategy(),
			new EscapeMovementStrategy(),
			new ItemMovementStrategy(),
			new RouteItemHuntMovementStrategy(),
			new ChaseOpponentMovementStrategy(),
			new BombSpotMovementStrategy()
		];
	}

	shouldPlaceBomb() {
		const opponent = this.getAliveOpponent();
		if (!canEscapeAfterPlantingBomb(this.store, this.player)) return false;

		if (this.player.previewBomb.wouldHitVisibleItem(this.store)) return false;
		if (this.player.bombWouldHitOpponent(this.store)) return true;

		if (!opponent) return false;
		const itemHuntBombSpot = this.bombSpotPlanner.findBestItemHuntToward(opponent);
		if (itemHuntBombSpot && samePosition(itemHuntBombSpot.position, this.player)) return true;

		const bombSpot = this.bombSpotPlanner.findBestToward(opponent);
		return Boolean(bombSpot && samePosition(bombSpot.position, this.player) && this.player.bombWouldHitTarget(this.store));
	}

	movePlayer() {
		const opponent = this.getAliveOpponent();
		const context = {
			store: this.store,
			player: this.player,
			opponent,
			bombSpotPlanner: this.bombSpotPlanner
		};

		for (const strategy of this.movementStrategies) {
			const decision = strategy.choose(context);
			if (!decision) continue;
			if (decision.step) this.movePlayerTo(decision.step);
			if (decision.handled) return;
		}
	}

	private getAliveOpponent() {
		return this.store.players.find((candidate) => candidate.id !== this.player.id && candidate.alive) ?? null;
	}

	private movePlayerTo(next: Position & Partial<{ direction: Direction }>) {
		const direction =
			DIRECTIONS.find((delta) => this.player.x + delta.x === next.x && this.player.y + delta.y === next.y)?.direction ??
			next.direction;

		const bomb = Bomb.findAt(this.store, next);
		if (bomb) {
			if (direction && this.player.kickBomb(this.store, bomb, direction)) {
				this.player.moveTo(next, direction);
			}
			return;
		}

		this.player.moveTo(next, direction);
	}
}
