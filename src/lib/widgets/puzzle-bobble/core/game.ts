import { Utils } from '../../shared/utils/utils';
import { PuzzleBobblesVG } from '../renderers/svg';
import { PBStoreType } from '../types';
import {
	BUBBLE_RADIUS,
	BUBBLE_SPEED,
	CANNON_ANGLE_MAX,
	CANNON_ANGLE_MIN,
	CANNON_TURN_SPEED,
	CELL_SIZE,
	GAP_SIZE,
	GRID_HEIGHT,
	GRID_WIDTH,
	PB_COLORS,
	POP_MIN_CLUSTER
} from './constants';

/* ────────────────── Coord helpers ────────────────── */

/** Center SVG-x of grid column col */
const cellCx = (col: number) => col * (CELL_SIZE + GAP_SIZE) + CELL_SIZE / 2;
/** Center SVG-y of grid row row */
const cellCy = (row: number) => row * (CELL_SIZE + GAP_SIZE) + 15 + CELL_SIZE / 2;

/** Column index from SVG x (clamped) */
const svgXToCol = (x: number) => Math.round((x - CELL_SIZE / 2) / (CELL_SIZE + GAP_SIZE));
/** Row index from SVG y */
const svgYToRow = (y: number) => Math.round((y - 15 - CELL_SIZE / 2) / (CELL_SIZE + GAP_SIZE));

/* ────────────────── Grid helpers ────────────────── */

const hasRemainingBubbles = (store: PBStoreType): boolean => store.grid.some((col) => col.some((cell) => cell.commitsCount > 0));

/** Return all cells reachable from (startCol, startRow) sharing the same color index (flood-fill, 4-dir). */
const floodFillSameColor = (store: PBStoreType, startCol: number, startRow: number, colorIdx: number): { x: number; y: number }[] => {
	const visited = new Set<string>();
	const result: { x: number; y: number }[] = [];
	const stack = [{ x: startCol, y: startRow }];

	while (stack.length) {
		const { x, y } = stack.pop()!;
		const key = `${x},${y}`;
		if (visited.has(key)) continue;
		if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) continue;
		const cell = store.grid[x]?.[y];
		if (!cell || cell.commitsCount === 0) continue;
		if ((store.cellBubbleColors[x]?.[y] ?? -1) !== colorIdx) continue;

		visited.add(key);
		result.push({ x, y });
		stack.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });
	}

	return result;
};

/** Return all cells connected (4-dir, any non-NONE) to row 0 — these are "anchored". */
const findAnchoredCells = (store: PBStoreType): Set<string> => {
	const anchored = new Set<string>();
	const stack: { x: number; y: number }[] = [];

	for (let x = 0; x < GRID_WIDTH; x++) {
		if (store.grid[x]?.[0]?.commitsCount > 0) {
			stack.push({ x, y: 0 });
		}
	}

	while (stack.length) {
		const { x, y } = stack.pop()!;
		const key = `${x},${y}`;
		if (anchored.has(key)) continue;
		if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) continue;
		if (!store.grid[x]?.[y] || store.grid[x][y].commitsCount === 0) continue;

		anchored.add(key);
		stack.push({ x: x - 1, y }, { x: x + 1, y }, { x, y: y - 1 }, { x, y: y + 1 });
	}

	return anchored;
};

/* ────────────────── AI: pick next shot ────────────────── */

/**
 * Simulate bubble path (with wall bounces) and return the grid cell it lands in,
 * plus the final angle used.
 */
const simulateShot = (startX: number, startY: number, angleDeg: number, store: PBStoreType): { col: number; row: number } | null => {
	const rad = (angleDeg * Math.PI) / 180;
	let vx = BUBBLE_SPEED * Math.cos(rad);
	let vy = -BUBBLE_SPEED * Math.sin(rad); // up = negative y

	const svgWidth = GRID_WIDTH * (CELL_SIZE + GAP_SIZE);
	let x = startX;
	let y = startY;

	for (let step = 0; step < 2000; step++) {
		x += vx;
		y += vy;

		// Wall bounce
		if (x < BUBBLE_RADIUS) {
			x = BUBBLE_RADIUS;
			vx = Math.abs(vx);
		}
		if (x > svgWidth - BUBBLE_RADIUS) {
			x = svgWidth - BUBBLE_RADIUS;
			vx = -Math.abs(vx);
		}

		// Off top → miss
		if (y < 0) return null;

		const col = svgXToCol(x);
		const row = svgYToRow(y);

		if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= GRID_WIDTH) continue;

		// Check if bubble center is close enough to a filled cell
		for (const [dc, dr] of [
			[0, 0],
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		]) {
			const nc = col + dc;
			const nr = row + dr;
			if (nc < 0 || nc >= GRID_WIDTH || nr < 0 || nr >= GRID_HEIGHT) continue;
			if (store.grid[nc]?.[nr]?.commitsCount > 0) {
				const cx = cellCx(nc);
				const cy = cellCy(nr);
				const dist = Math.hypot(x - cx, y - cy);
				if (dist < CELL_SIZE) {
					// Land in adjacent empty cell toward the shot direction
					const landCol = Math.max(0, Math.min(GRID_WIDTH - 1, svgXToCol(x)));
					const landRow = Math.max(0, Math.min(GRID_HEIGHT - 1, svgYToRow(y)));
					return { col: landCol, row: landRow };
				}
			}
		}

		// Hit first row ceiling
		if (row === 0 && store.grid[col]?.[0]?.commitsCount === 0) {
			return { col: Math.max(0, Math.min(GRID_WIDTH - 1, col)), row: 0 };
		}
	}
	return null;
};

/**
 * Choose an angle for the next shot of `bubbleColorIdx`.
 *
 * Priority tiers (stable per-shot seed = nextBubbleId):
 *   1. Pop: lands adjacent to ≥(POP_MIN_CLUSTER-1) same-color cells → cluster pops
 *   2. Build: lands adjacent to at least 1 same-color cell (within 2 rows)
 *   3. Any:  lands adjacent to any occupied cell (within 2 rows)
 *   4. Closest: no adjacency found → pick the angle whose landing is geometrically
 *      closest to any remaining occupied cell (avoids wasting shots at empty ceiling)
 */
const chooseBestAngle = (store: PBStoreType, cannonSvgX: number, cannonSvgY: number, bubbleColorIdx: number): number => {
	const seed = (store.nextBubbleId * 1664525 + 1013904223) >>> 0;

	const popCandidates: { angleDeg: number; score: number }[] = [];
	const sameColorCandidates: number[] = [];
	const anyCandidates: number[] = [];

	// Wider neighbourhood: same row ±1 col, plus up to 2 rows below (row+1, row+2)
	const NEIGHBOURHOOD: [number, number][] = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1],
		[-1, 1],
		[0, 1],
		[1, 1],
		[-1, 2],
		[0, 2],
		[1, 2]
	];

	for (let angleDeg = CANNON_ANGLE_MIN + 2; angleDeg <= CANNON_ANGLE_MAX - 2; angleDeg += 2) {
		const hit = simulateShot(cannonSvgX, cannonSvgY, angleDeg, store);
		if (!hit) continue;
		if ((store.grid[hit.col]?.[hit.row]?.commitsCount ?? 0) > 0) continue;

		let hasSameColorAdj = false;
		let hasAnyAdj = false;
		let bestCluster = 0;

		for (const [dc, dr] of NEIGHBOURHOOD) {
			const nc = hit.col + dc;
			const nr = hit.row + dr;
			if (nc < 0 || nc >= GRID_WIDTH || nr < 0 || nr >= GRID_HEIGHT) continue;
			if ((store.grid[nc]?.[nr]?.commitsCount ?? 0) === 0) continue;
			hasAnyAdj = true;
			if ((store.cellBubbleColors[nc]?.[nr] ?? -1) === bubbleColorIdx) {
				hasSameColorAdj = true;
				const sz = floodFillSameColor(store, nc, nr, bubbleColorIdx).length + 1;
				if (sz > bestCluster) bestCluster = sz;
			}
		}

		if (bestCluster >= POP_MIN_CLUSTER) {
			popCandidates.push({ angleDeg, score: bestCluster });
		} else if (hasSameColorAdj) {
			sameColorCandidates.push(angleDeg);
		} else if (hasAnyAdj) {
			anyCandidates.push(angleDeg);
		}
	}

	if (popCandidates.length > 0) {
		const maxScore = Math.max(...popCandidates.map((c) => c.score));
		const best = popCandidates.filter((c) => c.score === maxScore);
		return best[seed % best.length].angleDeg;
	}
	if (sameColorCandidates.length > 0) {
		return sameColorCandidates[seed % sameColorCandidates.length];
	}
	if (anyCandidates.length > 0) {
		return anyCandidates[seed % anyCandidates.length];
	}

	// Tier 4: no adjacency at all — aim the landing as close as possible to any filled cell
	let closestAngle = 90;
	let closestDist = Infinity;
	for (let angleDeg = CANNON_ANGLE_MIN + 2; angleDeg <= CANNON_ANGLE_MAX - 2; angleDeg += 2) {
		const hit = simulateShot(cannonSvgX, cannonSvgY, angleDeg, store);
		if (!hit) continue;
		if ((store.grid[hit.col]?.[hit.row]?.commitsCount ?? 0) > 0) continue;
		const lx = cellCx(hit.col);
		const ly = cellCy(hit.row);
		let minDist = Infinity;
		for (let x = 0; x < GRID_WIDTH; x++) {
			for (let y = 0; y < GRID_HEIGHT; y++) {
				if ((store.grid[x]?.[y]?.commitsCount ?? 0) > 0) {
					const d = Math.hypot(lx - cellCx(x), ly - cellCy(y));
					if (d < minDist) minDist = d;
				}
			}
		}
		if (minDist < closestDist) {
			closestDist = minDist;
			closestAngle = angleDeg;
		}
	}
	return closestAngle;
};

/* ────────────────── Snapshot ────────────────── */

const pushSnapshot = (store: PBStoreType) => {
	store.gameHistory.push({
		cannon: { ...store.cannon },
		activeBubble: store.activeBubble ? { ...store.activeBubble } : null,
		nextBubbleColorIndex: store.nextBubbleColorIndex,
		currentBubbleColorIndex: store.currentBubbleColorIndex
	});
};

/* ────────────────── Game lifecycle ────────────────── */

const startGame = async (store: PBStoreType) => {
	store.frameCount = 0;
	store.nextBubbleId = 0;
	store.gameHistory = [];
	store.cellEvents = [];
	store.popEvents = [];
	store.activeBubble = null;

	store.grid = Utils.createGridFromData(store);

	// Assign fixed palette colors to occupied cells
	const _theme = Utils.getCurrentTheme(store);
	const _noneColor = _theme.intensityColors[0];
	const _occupied: { x: number; y: number }[] = [];
	for (let _x = 0; _x < GRID_WIDTH; _x++) {
		for (let _y = 0; _y < GRID_HEIGHT; _y++) {
			if (store.grid[_x][_y].commitsCount > 0) _occupied.push({ x: _x, y: _y });
		}
	}
	const _numColors =
		_occupied.length <= 50 ? 2 : _occupied.length <= 150 ? 3 : _occupied.length <= 250 ? 4 : _occupied.length <= 350 ? 5 : 6;
	// ── Seeded RNG (LCG) ────────────────────────────────────────────────
	let _rngState = (_occupied.length * 2654435761) >>> 0;
	const _rng = (): number => {
		_rngState = (Math.imul(_rngState, 1664525) + 1013904223) >>> 0;
		return _rngState / 0x100000000;
	};

	store.cellBubbleColors = Array.from({ length: GRID_WIDTH }, () => new Array(GRID_HEIGHT).fill(-1));

	// Step 1: random initial assignment
	for (const { x: _x, y: _y } of _occupied) {
		store.cellBubbleColors[_x][_y] = Math.floor(_rng() * _numColors);
	}

	// Step 2: 3 rounds of majority-vote smoothing → natural color clusters
	for (let _round = 0; _round < 3; _round++) {
		const _prev = store.cellBubbleColors.map((col) => [...col]);
		for (const { x: _x, y: _y } of _occupied) {
			const _counts = new Array(_numColors).fill(0);
			let _total = 0;
			for (const [_dx, _dy] of [
				[-1, 0],
				[1, 0],
				[0, -1],
				[0, 1],
				[-1, -1],
				[1, -1],
				[-1, 1],
				[1, 1]
			]) {
				const _ni = _prev[_x + _dx]?.[_y + _dy] ?? -1;
				if (_ni >= 0) {
					_counts[_ni]++;
					_total++;
				}
			}
			if (_total > 0) {
				const _max = Math.max(..._counts);
				// Switch only when neighbours strongly agree (≥50 %) to preserve some variety
				if (_max >= _total * 0.5) {
					store.cellBubbleColors[_x][_y] = _counts.indexOf(_max);
				}
			}
		}
	}

	// Apply palette color back to grid cells
	for (const { x: _x, y: _y } of _occupied) {
		const _ci = store.cellBubbleColors[_x][_y];
		store.grid[_x][_y] = { ...store.grid[_x][_y], color: PB_COLORS[_ci] as string };
	}

	store.initialColors = store.grid.map((col) => col.map((cell) => (cell.commitsCount > 0 ? cell.color : _noneColor)));

	// Initialise next-bubble color (random from occupied palette)
	const _availableCI = [...new Set(_occupied.map(({ x, y }) => store.cellBubbleColors[x][y]))];
	store.nextBubbleColorIndex = _availableCI[Math.floor(_rng() * _availableCI.length)] ?? 0;

	if (!hasRemainingBubbles(store)) {
		const svg = PuzzleBobblesVG.generateAnimatedSVG(store);
		store.config.svgCallback(svg);
		store.config.gameOverCallback();
		return;
	}

	store.cannon = { angleDeg: 90 };
	store.cannonTargetAngle = -1;
	store.currentBubbleColorIndex = store.nextBubbleColorIndex;

	const MAX_FRAMES = 5000;

	while (hasRemainingBubbles(store) && store.frameCount < MAX_FRAMES) {
		updateGame(store);
	}

	const svg = PuzzleBobblesVG.generateAnimatedSVG(store);
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

const stopGame = (_store: PBStoreType) => {};

/* ────────────────── Per-frame update ────────────────── */

const updateGame = (store: PBStoreType) => {
	store.frameCount++;

	const svgWidth = GRID_WIDTH * (CELL_SIZE + GAP_SIZE);
	const gridBottomY = GRID_HEIGHT * (CELL_SIZE + GAP_SIZE) + 15;
	const cannonSvgX = svgWidth / 2;
	const cannonSvgY = gridBottomY + 30; // cannon center

	// ── No active bubble: aim and fire ───────────────────────────────────
	if (!store.activeBubble) {
		// Compute target angle once per shot (stable during rotation)
		if (store.cannonTargetAngle === -1) {
			store.cannonTargetAngle = chooseBestAngle(store, cannonSvgX, cannonSvgY, store.nextBubbleColorIndex);
		}
		const targetAngle = store.cannonTargetAngle;
		store.currentBubbleColorIndex = store.nextBubbleColorIndex;

		// Rotate cannon toward target (up to CANNON_TURN_SPEED per frame)
		const diff = targetAngle - store.cannon.angleDeg;
		if (Math.abs(diff) <= CANNON_TURN_SPEED) {
			store.cannon.angleDeg = targetAngle;
		} else {
			store.cannon.angleDeg += Math.sign(diff) * CANNON_TURN_SPEED;
			store.cannon.angleDeg = Math.max(CANNON_ANGLE_MIN, Math.min(CANNON_ANGLE_MAX, store.cannon.angleDeg));
			pushSnapshot(store);
			return;
		}

		// Fire the pre-selected bubble color
		const chosenColorIdx = store.nextBubbleColorIndex;
		store.currentBubbleColorIndex = chosenColorIdx;
		store.cannonTargetAngle = -1; // will recompute after this bubble lands

		// Pre-pick the NEXT bubble's color: random from colors still on the board
		const _existingCI = new Set<number>();
		for (let _x = 0; _x < GRID_WIDTH; _x++) {
			for (let _y = 0; _y < GRID_HEIGHT; _y++) {
				if (store.grid[_x][_y].commitsCount > 0) _existingCI.add(store.cellBubbleColors[_x]?.[_y] ?? 0);
			}
		}
		const _ciList = [..._existingCI];
		if (_ciList.length > 0) {
			const _seed = (store.frameCount * 1664525 + 1013904223) >>> 0;
			store.nextBubbleColorIndex = _ciList[_seed % _ciList.length];
		}

		const rad = (store.cannon.angleDeg * Math.PI) / 180;
		store.activeBubble = {
			id: store.nextBubbleId++,
			x: cannonSvgX,
			y: cannonSvgY,
			vx: BUBBLE_SPEED * Math.cos(rad),
			vy: -BUBBLE_SPEED * Math.sin(rad),
			colorIndex: chosenColorIdx,
			active: true
		};

		pushSnapshot(store);
		return;
	}

	// ── Move active bubble ───────────────────────────────────────────────
	const bubble = store.activeBubble;

	bubble.x += bubble.vx;
	bubble.y += bubble.vy;

	// Wall bounces
	if (bubble.x < BUBBLE_RADIUS) {
		bubble.x = BUBBLE_RADIUS;
		bubble.vx = Math.abs(bubble.vx);
	}
	if (bubble.x > svgWidth - BUBBLE_RADIUS) {
		bubble.x = svgWidth - BUBBLE_RADIUS;
		bubble.vx = -Math.abs(bubble.vx);
	}

	// Off top or bottom — discard
	if (bubble.y < 0 || bubble.y > cannonSvgY + 10) {
		store.activeBubble = null;
		store.cannonTargetAngle = -1;
		pushSnapshot(store);
		return;
	}

	// ── Collision detection ──────────────────────────────────────────────
	let landed = false;
	let landCol = -1;
	let landRow = -1;

	const bCol = svgXToCol(bubble.x);
	const bRow = svgYToRow(bubble.y);

	// Check proximity to every neighbor cell
	outer: for (let dc = -1; dc <= 1; dc++) {
		for (let dr = -1; dr <= 1; dr++) {
			const nc = bCol + dc;
			const nr = bRow + dr;
			if (nc < 0 || nc >= GRID_WIDTH || nr < 0 || nr >= GRID_HEIGHT) continue;
			const cx = cellCx(nc);
			const cy = cellCy(nr);
			const dist = Math.hypot(bubble.x - cx, bubble.y - cy);

			if (dist < CELL_SIZE * 0.9) {
				// Filled cell → land in the adjacent empty slot toward the shooter
				if (store.grid[nc]?.[nr]?.commitsCount > 0) {
					// Land in bCol/bRow if empty, otherwise find nearest empty neighbor
					if (store.grid[bCol]?.[bRow]?.commitsCount === 0 && bCol >= 0 && bCol < GRID_WIDTH && bRow >= 0 && bRow < GRID_HEIGHT) {
						landCol = bCol;
						landRow = bRow;
					} else {
						// Find first empty neighbor
						for (const [edc, edr] of [
							[0, 1],
							[-1, 0],
							[1, 0],
							[0, -1]
						]) {
							const ec = nc + edc;
							const er = nr + edr;
							if (ec >= 0 && ec < GRID_WIDTH && er >= 0 && er < GRID_HEIGHT && store.grid[ec][er].commitsCount === 0) {
								landCol = ec;
								landRow = er;
								break;
							}
						}
					}
					landed = true;
					break outer;
				}

				// Empty cell that's at row 0 (ceiling)
				if (nr === 0) {
					landCol = nc;
					landRow = 0;
					landed = true;
					break outer;
				}
			}
		}
	}

	// Ceiling collision
	if (!landed && bRow <= 0 && bCol >= 0 && bCol < GRID_WIDTH) {
		landCol = bCol;
		landRow = 0;
		landed = true;
	}

	if (landed && landCol >= 0 && landRow >= 0) {
		landCol = Math.max(0, Math.min(GRID_WIDTH - 1, landCol));
		landRow = Math.max(0, Math.min(GRID_HEIGHT - 1, landRow));

		// Place bubble in the grid
		const theme = Utils.getCurrentTheme(store);
		const noneColor = theme.intensityColors[0];
		const bubbleColor = (PB_COLORS[bubble.colorIndex] ?? PB_COLORS[0]) as string;
		store.grid[landCol][landRow] = {
			commitsCount: 1,
			color: bubbleColor,
			level: 'FIRST_QUARTILE'
		};
		store.cellBubbleColors[landCol][landRow] = bubble.colorIndex;

		// Record color event
		store.cellEvents.push({
			frameIndex: store.gameHistory.length,
			x: landCol,
			y: landRow,
			color: bubbleColor
		});

		// ── Pop check ────────────────────────────────────────────────────
		const cluster = floodFillSameColor(store, landCol, landRow, bubble.colorIndex);

		if (cluster.length >= POP_MIN_CLUSTER) {
			const popColor = bubbleColor;

			// Clear only the same-color cluster — no cascade drop
			for (const { x, y } of cluster) {
				store.grid[x][y] = {
					commitsCount: 0,
					color: noneColor,
					level: 'NONE'
				};
				store.cellBubbleColors[x][y] = -1;
				store.cellEvents.push({
					frameIndex: store.gameHistory.length,
					x,
					y,
					color: noneColor
				});
			}

			// Record pop event (cluster only — no cascade)
			store.popEvents.push({
				frameIndex: store.gameHistory.length,
				cells: cluster,
				color: popColor
			});

			store.config.pointsIncreasedCallback(store.cellEvents.length);
		}

		store.activeBubble = null;
		store.cannonTargetAngle = -1;
	}

	pushSnapshot(store);
};

export const PuzzleBobbleGame = { startGame, stopGame };
