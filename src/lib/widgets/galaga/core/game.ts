import type { ContributionLevel } from '../../shared/types';
import { Utils } from '../../shared/utils/utils';
import { GalagaSVG } from '../renderers/svg';
import { GalagaStoreType } from '../types';
import {
	BULLET_SPEED,
	FIRE_RATE,
	FRAMES_PER_TARGET_MAX,
	FRAMES_PER_TARGET_MIN,
	GRID_HEIGHT,
	GRID_WIDTH,
	MAX_BULLETS,
	SHIP_HALF_WIDTH,
	SHIP_SPEED,
	SHIP_Y
} from './constants';

/* ────────────────── Level helpers ────────────────── */

const LEVEL_ORDER: ContributionLevel[] = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];

/** Return the level one step below the given level (minimum NONE). */
const decrementLevel = (level: ContributionLevel): ContributionLevel => {
	const idx = LEVEL_ORDER.indexOf(level);
	return LEVEL_ORDER[Math.max(0, idx - 1)];
};

const randomFramesForTarget = () => Math.floor(Math.random() * (FRAMES_PER_TARGET_MAX - FRAMES_PER_TARGET_MIN + 1)) + FRAMES_PER_TARGET_MIN;

const hasRemainingEnemies = (store: GalagaStoreType): boolean => store.grid.some((col) => col.some((cell) => cell.commitsCount > 0));

/**
 * Find the best column to target near the ship's current position.
 * Searches within an expanding radius (starting at 5) around the ship,
 * excluding `excludeCol`. Returns the highest-scoring column found.
 */
const findTargetColumn = (store: GalagaStoreType, excludeCol = -1): number => {
	const shipCol = Math.round(store.ship.x - 0.5);

	const scoreCol = (x: number): number =>
		store.grid[x].reduce((sum, cell) => {
			const weights = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
			return sum + (weights[cell.level] ?? 0);
		}, 0);

	for (let radius = 3; radius <= GRID_WIDTH; radius++) {
		let bestCol = -1;
		let bestScore = 0;

		for (let offset = -radius; offset <= radius; offset++) {
			const x = shipCol + offset;
			if (x < 0 || x >= GRID_WIDTH) continue;
			if (x === excludeCol) continue;
			const s = scoreCol(x);
			if (s > bestScore) {
				bestScore = s;
				bestCol = x;
			}
		}

		if (bestCol !== -1) return bestCol;
	}

	// Absolute fallback: first non-empty column
	for (let x = 0; x < GRID_WIDTH; x++) {
		if (x !== excludeCol && store.grid[x].some((cell) => cell.commitsCount > 0)) return x;
	}

	return Math.floor(GRID_WIDTH / 2);
};

const pushSnapshot = (store: GalagaStoreType) => {
	store.gameHistory.push({
		ship: { x: store.ship.x },
		bullets: store.bullets.map((b) => ({ ...b }))
	});
};

/* ────────────────── Game lifecycle ────────────────── */

const startGame = async (store: GalagaStoreType) => {
	store.frameCount = 0;
	store.nextBulletId = 0;
	store.gameHistory = [];
	store.cellEvents = [];
	store.explosionEvents = [];
	store.bullets = [];

	store.grid = Utils.createGridFromData(store);
	store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));

	if (!hasRemainingEnemies(store)) {
		const svg = GalagaSVG.generateAnimatedSVG(store);
		store.config.svgCallback(svg);
		store.config.gameOverCallback();
		return;
	}

	store.ship = { x: GRID_WIDTH / 2 };
	store.currentTargetCol = findTargetColumn(store);
	store.framesShootingAtTarget = 0;
	store.framesAllowedForTarget = randomFramesForTarget();

	const MAX_FRAMES = 3000;
	while (hasRemainingEnemies(store) && store.frameCount < MAX_FRAMES) {
		updateGame(store);
	}

	const svg = GalagaSVG.generateAnimatedSVG(store);
	store.config.svgCallback(svg);

	if (store.config.gameStatsCallback) {
		store.config.gameStatsCallback({
			totalScore: store.cellEvents.length,
			steps: store.frameCount,
			ghostsEaten: 0
		});
	}

	store.config.gameOverCallback();
};

const stopGame = (_store: GalagaStoreType) => {};

/* ────────────────── Per-frame update ────────────────── */

const updateGame = (store: GalagaStoreType) => {
	store.frameCount++;

	const { grid, ship } = store;
	const theme = Utils.getCurrentTheme(store);

	// ── Move bullets upward & check collisions ───────────────────────────
	for (const bullet of store.bullets) {
		if (!bullet.active) continue;

		bullet.y -= BULLET_SPEED;

		// Off the top of the screen — deactivate
		if (bullet.y < -1) {
			bullet.active = false;
			continue;
		}

		// Column index the bullet occupies (bullet.x = col + 0.5)
		const col = Math.round(bullet.x - 0.5);
		// Collision when bullet base (bottom of sprite) enters the cell's y range
		const row = Math.floor(bullet.y);

		if (col >= 0 && col < GRID_WIDTH && row >= 0 && row < GRID_HEIGHT) {
			if (grid[col][row].commitsCount > 0) {
				const prevColor = grid[col][row].color;
				const newLevel = decrementLevel(grid[col][row].level);
				grid[col][row].level = newLevel;
				grid[col][row].color = theme.intensityColors[LEVEL_ORDER.indexOf(newLevel)];
				if (newLevel === 'NONE') {
					grid[col][row].commitsCount = 0;
					store.explosionEvents.push({
						frameIndex: store.gameHistory.length,
						x: col,
						y: row,
						color: prevColor
					});
				}

				store.cellEvents.push({
					frameIndex: store.gameHistory.length,
					x: col,
					y: row,
					color: grid[col][row].color
				});

				store.config.pointsIncreasedCallback(store.cellEvents.length);
				bullet.active = false;
			}
		}
	}

	// Remove inactive bullets
	store.bullets = store.bullets.filter((b) => b.active);

	// ── Ship AI: move toward locked-on target column ────────────────────
	// If current target is depleted, pick a fresh one
	if (!grid[store.currentTargetCol]?.some((cell) => cell.commitsCount > 0)) {
		store.currentTargetCol = findTargetColumn(store);
		store.framesShootingAtTarget = 0;
	}

	const targetCol = store.currentTargetCol;
	const targetX = targetCol + 0.5;
	const dx = targetX - ship.x;

	if (Math.abs(dx) > SHIP_SPEED) {
		ship.x += Math.sign(dx) * SHIP_SPEED;
	} else {
		ship.x = targetX;
	}

	ship.x = Math.max(SHIP_HALF_WIDTH, Math.min(GRID_WIDTH - SHIP_HALF_WIDTH, ship.x));

	// ── Fire: shoot for FRAMES_PER_TARGET frames then switch target ───────
	const aligned = Math.abs(ship.x - targetX) < 0.5;
	const columnHasEnemies = grid[targetCol].some((cell) => cell.commitsCount > 0);

	if (aligned && columnHasEnemies) {
		if (store.framesShootingAtTarget >= store.framesAllowedForTarget) {
			// Done with this target — pick next column (excluding current)
			store.currentTargetCol = findTargetColumn(store, targetCol);
			store.framesShootingAtTarget = 0;
			store.framesAllowedForTarget = randomFramesForTarget();
		} else {
			if (store.frameCount % FIRE_RATE === 0 && store.bullets.length < MAX_BULLETS) {
				store.bullets.push({
					id: store.nextBulletId++,
					x: targetX,
					y: SHIP_Y - 1.0,
					active: true
				});
			}
			store.framesShootingAtTarget++;
		}
	}

	pushSnapshot(store);
};

export const GalagaGame = { startGame, stopGame };
