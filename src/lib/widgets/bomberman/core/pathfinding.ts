import { AttackSide, BombModel, BombermanStore, PlayerModel, Position, RoutePreference } from '../types';
import { BOMB_FUSE_FRAMES } from './constants';
import { Bomb } from '../entities/bomb';
import { Explosion } from '../entities/explosion';
import { Player } from '../entities/player';
import { getAdjacentPositions, isContributionCell, isEmptyCell, isPassableCell, manhattan, positionKey, samePosition } from './board';
import { AI, PATH_BLAST_COST } from './constants';

export type RouteStep = { firstStep: Position | null; distance: number };
export type EstimatedRoute = RouteStep & { cost: number; blastedCells: number };
type WeightedRouteStep = EstimatedRoute & { position: Position };
export type PathOptions = {
	avoidFirstStep?: Position | null;
	attackSide?: AttackSide;
	origin?: Position;
	routePreference?: RoutePreference;
	target?: Position;
};

export const getPreviousPlayerPosition = (store: BombermanStore, playerId: PlayerModel['id']): Position | null => {
	const previousFrame = store.gameHistory[store.gameHistory.length - 2];
	const previousPlayer = previousFrame?.players.find((candidate) => candidate.id === playerId);
	return previousPlayer ? { x: previousPlayer.x, y: previousPlayer.y } : null;
};

export const isBacktrackingStep = (store: BombermanStore, player: PlayerModel, next: Position) => {
	const previousPosition = getPreviousPlayerPosition(store, player.id);
	return Boolean(previousPosition && samePosition(previousPosition, next));
};

export const sortPathOptions = <T extends Position>(positions: T[], options: PathOptions): T[] =>
	positions.sort((a, b) => {
		const aBacktracks = options.avoidFirstStep && samePosition(a, options.avoidFirstStep) ? 1 : 0;
		const bBacktracks = options.avoidFirstStep && samePosition(b, options.avoidFirstStep) ? 1 : 0;
		if (aBacktracks !== bBacktracks) return aBacktracks - bBacktracks;
		if (options.target) {
			const distanceDiff = manhattan(a, options.target) - manhattan(b, options.target);
			if (distanceDiff !== 0) return distanceDiff;

			const axisDiff = routeAxisRank(a, options) - routeAxisRank(b, options);
			if (axisDiff !== 0) return axisDiff;

			const sideDiff = attackSideRank(a, options) - attackSideRank(b, options);
			if (sideDiff !== 0) return sideDiff;
		}
		return 0;
	});

const routeAxisRank = (position: Position, options: PathOptions) => {
	if (!options.origin || !options.routePreference) return 0;

	const axis = position.x !== options.origin.x ? 'horizontal-first' : 'vertical-first';
	return axis === options.routePreference ? 0 : 1;
};

const attackSideRank = (position: Position, options: PathOptions) => {
	if (!options.attackSide || !options.target) return 0;

	if (options.attackSide === 'left') return position.x <= options.target.x ? 0 : 1;
	return position.x >= options.target.x ? 0 : 1;
};

export const findPathToTarget = (
	store: BombermanStore,
	start: Position,
	isTarget: (position: Position) => boolean,
	options: PathOptions = {}
): RouteStep | null => {
	const visited = new Set([positionKey(start)]);
	const queue: { position: Position; firstStep: Position | null; distance: number }[] = [
		{ position: start, firstStep: null, distance: 0 }
	];
	let queueHead = 0;

	while (queueHead < queue.length) {
		const current = queue[queueHead++];
		if (current.firstStep && isTarget(current.position)) {
			return {
				firstStep: current.firstStep,
				distance: current.distance
			};
		}

		const nextPositions = sortPathOptions(
			getAdjacentPositions(current.position),
			current.firstStep
				? {
						attackSide: options.attackSide,
						origin: current.position,
						routePreference: options.routePreference,
						target: options.target
					}
				: { ...options, origin: current.position }
		);
		for (const next of nextPositions) {
			const key = positionKey(next);
			if (visited.has(key) || !isPassableCell(store, next)) continue;

			visited.add(key);
			queue.push({
				position: next,
				firstStep: current.firstStep ?? { x: next.x, y: next.y },
				distance: current.distance + 1
			});
		}
	}

	return null;
};

export const estimateFastestRoute = (
	store: BombermanStore,
	start: Position,
	target: Position,
	openedCells: Set<string> = new Set()
): EstimatedRoute | null => {
	const queue: WeightedRouteStep[] = [{ position: start, firstStep: null, distance: 0, cost: 0, blastedCells: 0 }];
	const bestCosts = new Map<string, number>([[positionKey(start), 0]]);

	while (queue.length > 0) {
		const current = takeLowestCostRoute(queue, target);

		if (current.firstStep && samePosition(current.position, target)) {
			return {
				firstStep: current.firstStep,
				distance: current.distance,
				cost: current.cost,
				blastedCells: current.blastedCells
			};
		}

		for (const next of getAdjacentPositions(current.position)) {
			if (Bomb.findAt(store, next) || Explosion.isActiveAt(store, next)) continue;

			const key = positionKey(next);
			const opened = openedCells.has(key);
			const contribution = isContributionCell(store, next) && !opened;
			const walkable = isEmptyCell(store, next) || opened || contribution || samePosition(next, target);
			if (!walkable) continue;

			const stepCost = contribution ? PATH_BLAST_COST : 1;
			const nextCost = current.cost + stepCost;
			const previousBest = bestCosts.get(key);
			if (previousBest !== undefined && previousBest <= nextCost) continue;

			bestCosts.set(key, nextCost);
			queue.push({
				position: { x: next.x, y: next.y },
				firstStep: current.firstStep ?? { x: next.x, y: next.y },
				distance: current.distance + 1,
				cost: nextCost,
				blastedCells: current.blastedCells + (contribution ? 1 : 0)
			});
		}
	}

	return null;
};

const takeLowestCostRoute = (queue: WeightedRouteStep[], target: Position) => {
	let bestIndex = 0;
	for (let index = 1; index < queue.length; index++) {
		const best = queue[bestIndex];
		const candidate = queue[index];
		const costDiff = candidate.cost - best.cost;
		const heuristicDiff = manhattan(candidate.position, target) - manhattan(best.position, target);
		if (costDiff < 0 || (costDiff === 0 && heuristicDiff < 0)) bestIndex = index;
	}
	return queue.splice(bestIndex, 1)[0];
};

export const findEscapeStep = (store: BombermanStore, player: PlayerModel): Position | null => {
	const maxDepth = Math.max(BOMB_FUSE_FRAMES, AI.ESCAPE_MIN_SEARCH_DEPTH);
	const queue: { position: Position; firstStep: Position | null; depth: number }[] = [{ position: player, firstStep: null, depth: 0 }];
	const visited = new Set([positionKey(player)]);
	let queueHead = 0;

	while (queueHead < queue.length) {
		const current = queue[queueHead++];
		if (current.firstStep && player.isSafeStandingCell(store, current.position)) return current.firstStep;
		if (current.depth >= maxDepth) continue;

		const nextPositions = getAdjacentPositions(current.position).sort((a, b) => {
			const aThreats = Bomb.threateningAt(store, a, player.id).length;
			const bThreats = Bomb.threateningAt(store, b, player.id).length;
			return aThreats - bThreats;
		});

		for (const next of nextPositions) {
			const key = positionKey(next);
			if (visited.has(key) || !isEmptyCell(store, next) || Bomb.findAt(store, next) || Explosion.isActiveAt(store, next, player.id))
				continue;

			const nextDepth = current.depth + 1;
			const explodesBeforeNextMove = Bomb.threateningAt(store, next, player.id).some((bomb) => bomb.timer <= nextDepth);
			if (explodesBeforeNextMove) continue;

			visited.add(key);
			queue.push({
				position: next,
				firstStep: current.firstStep ?? { x: next.x, y: next.y },
				depth: nextDepth
			});
		}
	}

	return null;
};

export const findReachableBombOrigins = (store: BombermanStore, player: PlayerModel): (RouteStep & { position: Position })[] => {
	const visited = new Set([positionKey(player)]);
	const queue: (RouteStep & { position: Position })[] = [{ position: player, firstStep: null, distance: 0 }];
	const origins: (RouteStep & { position: Position })[] = [];
	const previousPosition = getPreviousPlayerPosition(store, player.id);
	let queueHead = 0;

	while (queueHead < queue.length) {
		const current = queue[queueHead++];
		origins.push(current);

		const nextPositions = sortPathOptions(
			getAdjacentPositions(current.position),
			current.firstStep
				? {
						attackSide: player.attackSide,
						origin: current.position,
						routePreference: player.routePreference,
						target: player
					}
				: {
						attackSide: player.attackSide,
						avoidFirstStep: previousPosition,
						origin: current.position,
						routePreference: player.routePreference,
						target: player
					}
		);
		for (const next of nextPositions) {
			const key = positionKey(next);
			if (visited.has(key) || !isPassableCell(store, next) || player.isOwnExplosionDangerCell(store, next)) {
				continue;
			}

			visited.add(key);
			queue.push({
				position: { x: next.x, y: next.y },
				firstStep: current.firstStep ?? { x: next.x, y: next.y },
				distance: current.distance + 1
			});
		}
	}

	return origins;
};

export const canEscapeAfterPlantingBombAt = (store: BombermanStore, player: PlayerModel, position: Position) => {
	if (!isEmptyCell(store, position) || Bomb.findAt(store, position)) return false;

	const virtualBomb: BombModel = new Bomb(-1, player.id, position.x, position.y, player.blastRange, BOMB_FUSE_FRAMES, false);
	const virtualPlayer = Player.fromState({ ...player, x: position.x, y: position.y });

	store.bombs.push(virtualBomb);
	try {
		return Boolean(findEscapeStep(store, virtualPlayer));
	} finally {
		store.bombs.pop();
	}
};

export const canEscapeAfterPlantingBomb = (store: BombermanStore, player: PlayerModel) => {
	return canEscapeAfterPlantingBombAt(store, player, player);
};
