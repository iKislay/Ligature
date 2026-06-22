import { ContributionLevel } from '../../shared/types';
import { Utils } from '../../shared/utils/utils';
import { BreakoutSVG } from '../renderers/svg';
import { BreakoutStoreType } from '../types';
import {
	BALL_INITIAL_DX,
	BALL_INITIAL_DY,
	BALL_RADIUS,
	CELL_SIZE,
	GAP_SIZE,
	GRID_HEIGHT,
	GRID_WIDTH,
	MAX_BOUNCE_ANGLE,
	PADDLE_SPEED,
	PADDLE_WIDTH,
	PADDLE_Y
} from './constants';

/** Fraction of a grid unit occupied by the visible brick face (gap excluded). */
const CELL_RATIO = CELL_SIZE / (CELL_SIZE + GAP_SIZE); // ≈ 0.909

/** Ordered levels from weakest to strongest. */
const LEVEL_ORDER: ContributionLevel[] = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];

/** Return the level one step below the given level (minimum NONE). */
const decrementLevel = (level: ContributionLevel): ContributionLevel => {
	const idx = LEVEL_ORDER.indexOf(level);
	return LEVEL_ORDER[Math.max(0, idx - 1)];
};

/* ────────────────── Initialise game state ────────────────── */

const placeBall = (store: BreakoutStoreType) => {
	store.ball = {
		x: GRID_WIDTH / 2,
		y: PADDLE_Y - 1.5,
		dx: BALL_INITIAL_DX,
		dy: BALL_INITIAL_DY // negative = moving upward toward bricks
	};
};

const placePaddle = (store: BreakoutStoreType) => {
	store.paddle = {
		x: (GRID_WIDTH - PADDLE_WIDTH) / 2,
		width: PADDLE_WIDTH
	};
};

/* ────────────────── Main loop ────────────────── */

const startGame = async (store: BreakoutStoreType) => {
	store.frameCount = 0;
	store.framesSinceLastBrickHit = 0;
	store.gameHistory = [];
	store.brickEvents = [];

	store.grid = Utils.createGridFromData(store);
	// Snapshot initial colors before any bricks are hit (used by SVG renderer)
	store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));

	const totalBricks = store.grid.reduce((sum, col) => sum + col.filter((c) => c.commitsCount > 0).length, 0);

	if (totalBricks === 0) {
		const svg = BreakoutSVG.generateAnimatedSVG(store);
		store.config.svgCallback(svg);
		store.config.gameOverCallback();
		return;
	}

	placeBall(store);
	placePaddle(store);
	store.targetBrick = pickRandomTarget(store);
	store.bouncesSinceTargetSet = 0;

	const MAX_FRAMES = 3000;
	while (store.grid.some((col) => col.some((c) => c.commitsCount > 0)) && store.frameCount < MAX_FRAMES) {
		updateGame(store);
		if (store.frameCount % 200 === 0) {
			const rem = store.grid.reduce((sum, col) => sum + col.filter((c) => c.commitsCount > 0).length, 0);
		}
	}

	const svg = BreakoutSVG.generateAnimatedSVG(store);
	store.config.svgCallback(svg);
	if (store.config.gameStatsCallback) {
		store.config.gameStatsCallback({
			totalScore: countBrokenBricks(store),
			steps: store.frameCount,
			ghostsEaten: 0
		});
	}
	store.config.gameOverCallback();
};

const stopGame = (_store: BreakoutStoreType) => {};

/* ────────────────── Per-frame update ────────────────── */

const updateGame = (store: BreakoutStoreType) => {
	store.frameCount++;

	const { ball, paddle, grid } = store;

	// ── Sub-step movement ─────────────────────────────────────────────────
	// Split each frame into small steps so the ball never travels more than
	// BALL_RADIUS in a single step, preventing tunnelling through bricks.
	const speed = Math.hypot(ball.dx, ball.dy);
	const subSteps = Math.ceil(speed / BALL_RADIUS);
	const dt = 1 / subSteps;

	for (let s = 0; s < subSteps; s++) {
		ball.x += ball.dx * dt;
		ball.y += ball.dy * dt;

		// ── Wall collisions ────────────────────────────────────────────────
		if (ball.x - BALL_RADIUS <= 0) {
			ball.x = BALL_RADIUS;
			ball.dx = Math.abs(ball.dx);
		}
		if (ball.x + BALL_RADIUS >= GRID_WIDTH) {
			ball.x = GRID_WIDTH - BALL_RADIUS;
			ball.dx = -Math.abs(ball.dx);
		}
		if (ball.y - BALL_RADIUS <= 0) {
			ball.y = BALL_RADIUS;
			ball.dy = Math.abs(ball.dy);
		}

		// ── Paddle collision ───────────────────────────────────────────────
		const paddleLeft = paddle.x;
		const paddleRight = paddle.x + PADDLE_WIDTH;

		if (
			ball.dy > 0 &&
			ball.y + BALL_RADIUS >= PADDLE_Y &&
			ball.y - BALL_RADIUS < PADDLE_Y + 0.5 &&
			ball.x >= paddleLeft - BALL_RADIUS &&
			ball.x <= paddleRight + BALL_RADIUS
		) {
			ball.y = PADDLE_Y - BALL_RADIUS;
			// Angle-based bounce: hit position on paddle maps linearly to angle.
			// Centre → straight up (0°). Far edges → ±MAX_BOUNCE_ANGLE from vertical.
			const paddleCenter = paddleLeft + PADDLE_WIDTH / 2;
			const hitOffset = Math.max(-1, Math.min(1, (ball.x - paddleCenter) / (PADDLE_WIDTH / 2)));
			const speed = Math.hypot(ball.dx, ball.dy);
			const rad = hitOffset * MAX_BOUNCE_ANGLE * (Math.PI / 180);
			ball.dx = speed * Math.sin(rad);
			ball.dy = -speed * Math.cos(rad); // always upward
			// Count paddle bounces without hitting the current target.
			// After 5 misses, give up and pick a new random target.
			store.bouncesSinceTargetSet++;
			if (store.bouncesSinceTargetSet >= 5) {
				store.targetBrick = pickRandomTarget(store);
				store.bouncesSinceTargetSet = 0;
			}
		}

		// Safety: ball fell past the paddle
		if (ball.y > PADDLE_Y + 1) {
			ball.x = GRID_WIDTH / 2;
			ball.y = PADDLE_Y - 1.5;
			ball.dy = -Math.abs(ball.dy);
		}

		// ── Brick collision (circle-vs-AABB, edge-precise) ────────────────
		const colMin = Math.max(0, Math.floor(ball.x - BALL_RADIUS));
		const colMax = Math.min(GRID_WIDTH - 1, Math.floor(ball.x + BALL_RADIUS));
		const rowMin = Math.max(0, Math.floor(ball.y - BALL_RADIUS));
		const rowMax = Math.min(GRID_HEIGHT - 1, Math.floor(ball.y + BALL_RADIUS));

		let flipDx = false;
		let flipDy = false;
		const theme = Utils.getCurrentTheme(store);

		for (let cx = colMin; cx <= colMax; cx++) {
			for (let cy = rowMin; cy <= rowMax; cy++) {
				if (grid[cx][cy].commitsCount === 0) continue;

				// Nearest point on the visible brick face (gap excluded)
				const nearX = Math.max(cx, Math.min(cx + CELL_RATIO, ball.x));
				const nearY = Math.max(cy, Math.min(cy + CELL_RATIO, ball.y));
				const distSq = (ball.x - nearX) ** 2 + (ball.y - nearY) ** 2;

				if (distSq >= BALL_RADIUS * BALL_RADIUS) continue; // no overlap

				// ── Reduce brick level by one hit ──────────────────────────
				const oldLevel = grid[cx][cy].level;
				const newLevel = decrementLevel(oldLevel);
				grid[cx][cy].level = newLevel;

				if (newLevel === 'NONE') {
					grid[cx][cy].commitsCount = 0;
					grid[cx][cy].color = theme.intensityColors[0];
					// If this was the current target, pick a new one immediately
					if (store.targetBrick?.cx === cx && store.targetBrick?.cy === cy) {
						store.targetBrick = pickRandomTarget(store);
						store.bouncesSinceTargetSet = 0;
					}
				} else {
					const levelIndex = LEVEL_ORDER.indexOf(newLevel);
					grid[cx][cy].color = theme.intensityColors[levelIndex];
				}
				// Record color-change event keyed to the upcoming gameHistory index
				store.brickEvents.push({ frameIndex: store.gameHistory.length, x: cx, y: cy, color: grid[cx][cy].color });

				// Push ball out of brick and determine bounce axis
				const penX = BALL_RADIUS - Math.abs(ball.x - nearX);
				const penY = BALL_RADIUS - Math.abs(ball.y - nearY);
				if (penX <= penY) {
					ball.x += ball.dx < 0 ? penX : -penX;
					flipDx = true;
				} else {
					ball.y += ball.dy < 0 ? penY : -penY;
					flipDy = true;
				}

				store.framesSinceLastBrickHit = 0;
				store.config.pointsIncreasedCallback(countBrokenBricks(store));
			}
		}

		if (flipDx) ball.dx = -ball.dx;
		if (flipDy) ball.dy = -ball.dy;
	}

	// ── Paddle AI — position to aim at the current target brick ──────────
	if (ball.dy > 0 && store.targetBrick) {
		const target = store.targetBrick;
		// Predict where the ball will cross the paddle level (accounting for wall bounces)
		const timeToLand = (PADDLE_Y - ball.y) / ball.dy;
		let predictedX = ball.x + ball.dx * timeToLand;
		// Fold wall reflections
		predictedX = Math.abs(((predictedX % (2 * GRID_WIDTH)) + 2 * GRID_WIDTH) % (2 * GRID_WIDTH));
		if (predictedX > GRID_WIDTH) predictedX = 2 * GRID_WIDTH - predictedX;
		// Required angle to reach target from predicted landing x
		const tx = target.cx + 0.5;
		const ty = target.cy + 0.5;
		const vertDist = PADDLE_Y - ty; // positive: target is above paddle
		const horizDist = tx - predictedX;
		const targetAngleDeg = Math.atan2(horizDist, Math.max(vertDist, 0.5)) * (180 / Math.PI);
		const clampedAngle = Math.max(-MAX_BOUNCE_ANGLE, Math.min(MAX_BOUNCE_ANGLE, targetAngleDeg));
		// Hit offset that would produce this angle
		const desiredHitOffset = clampedAngle / MAX_BOUNCE_ANGLE; // [-1, 1]
		// Paddle must be positioned so ball lands at the right spot
		const desiredPaddleCenter = predictedX - desiredHitOffset * (PADDLE_WIDTH / 2);
		const desiredPaddleX = Math.max(0, Math.min(GRID_WIDTH - PADDLE_WIDTH, desiredPaddleCenter - PADDLE_WIDTH / 2));
		// Move paddle toward the desired position
		if (paddle.x < desiredPaddleX - PADDLE_SPEED) {
			paddle.x += PADDLE_SPEED;
		} else if (paddle.x > desiredPaddleX + PADDLE_SPEED) {
			paddle.x -= PADDLE_SPEED;
		} else {
			paddle.x = desiredPaddleX;
		}
	} else if (ball.dy > 0) {
		// No target: just track the ball so it doesn't miss
		const paddleCenter = paddle.x + PADDLE_WIDTH / 2;
		if (paddleCenter < ball.x - 0.5) paddle.x = Math.min(paddle.x + PADDLE_SPEED, GRID_WIDTH - PADDLE_WIDTH);
		else if (paddleCenter > ball.x + 0.5) paddle.x = Math.max(paddle.x - PADDLE_SPEED, 0);
	}

	// ── Snapshot ───────────────────────────────────────────────────────────
	pushSnapshot(store);
};

/* ────────────────── Helpers ────────────────── */

const pushSnapshot = (store: BreakoutStoreType) => {
	// Only ball + paddle — brick changes are tracked separately in brickEvents
	store.gameHistory.push({
		ball: { ...store.ball },
		paddle: { ...store.paddle }
	});
};

const countBrokenBricks = (store: BreakoutStoreType): number => {
	let broken = 0;
	store.grid.forEach((col) =>
		col.forEach((cell) => {
			if (cell.commitsCount === 0) broken++;
		})
	);
	return broken;
};

/** Pick a random live brick as the AI's next target. */
const pickRandomTarget = (store: BreakoutStoreType): { cx: number; cy: number } | null => {
	const live: { cx: number; cy: number }[] = [];
	for (let cx = 0; cx < GRID_WIDTH; cx++) {
		for (let cy = 0; cy < GRID_HEIGHT; cy++) {
			if (store.grid[cx]?.[cy]?.commitsCount > 0) live.push({ cx, cy });
		}
	}
	if (live.length === 0) return null;
	return live[Math.floor(Math.random() * live.length)];
};

export const BreakoutGame = {
	startGame,
	stopGame
};
