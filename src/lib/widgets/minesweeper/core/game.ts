import { Renderer } from '../renderers/svg';
import { MinesweeperCell, MinesweeperStore } from '../types';
import { GRID_HEIGHT, GRID_WIDTH, MINESWEEPER_END_HOLD_FRAMES, MINESWEEPER_MAX_MOVE_FRAMES, MINESWEEPER_MAX_STEPS } from './constants';

type Position = { x: number; y: number };
type DeductionAction = { x: number; y: number; type: 'flag' | 'reveal'; probability: number };

const getNeighbors = (x: number, y: number): Position[] => {
	const neighbors: Position[] = [];
	for (let dx = -1; dx <= 1; dx++) {
		for (let dy = -1; dy <= 1; dy++) {
			if (dx === 0 && dy === 0) continue;
			const nx = x + dx;
			const ny = y + dy;
			if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) continue;
			neighbors.push({ x: nx, y: ny });
		}
	}
	return neighbors;
};

const cloneBoard = (board: MinesweeperCell[][]): MinesweeperCell[][] => board.map((col) => col.map((cell) => ({ ...cell })));

const createResolvedHoldBoard = (store: MinesweeperStore): MinesweeperCell[][] => {
	const holdBoard = cloneBoard(store.board);

	for (const column of holdBoard) {
		for (const cell of column) {
			cell.showNumber = false;
			const revealUnflaggedMine = cell.isMine && !cell.flagged;
			cell.showMine = revealUnflaggedMine;
			cell.highlightMine = revealUnflaggedMine;
			if (revealUnflaggedMine) {
				cell.flagged = false;
			}
		}
	}

	return holdBoard;
};

const forEachCell = (board: MinesweeperCell[][], cb: (cell: MinesweeperCell) => void) => {
	for (const column of board) {
		for (const cell of column) {
			cb(cell);
		}
	}
};

const countCells = (board: MinesweeperCell[][], predicate: (cell: MinesweeperCell) => boolean) => {
	let total = 0;
	forEachCell(board, (cell) => {
		if (predicate(cell)) total++;
	});
	return total;
};

const listCells = (board: MinesweeperCell[][], predicate: (cell: MinesweeperCell) => boolean) => {
	const cells: MinesweeperCell[] = [];
	forEachCell(board, (cell) => {
		if (predicate(cell)) cells.push(cell);
	});
	return cells;
};

const buildBoard = (store: MinesweeperStore) => {
	store.board = Array.from({ length: GRID_WIDTH }, (_, x) =>
		Array.from({ length: GRID_HEIGHT }, (_, y) => ({
			x,
			y,
			isMine: store.grid[x]?.[y]?.commitsCount > 0,
			adjacentMines: 0,
			revealed: false,
			flagged: false,
			exploded: false,
			guessed: false
		}))
	);

	for (let x = 0; x < GRID_WIDTH; x++) {
		for (let y = 0; y < GRID_HEIGHT; y++) {
			const cell = store.board[x][y];
			cell.adjacentMines = getNeighbors(x, y).filter((n) => store.board[n.x][n.y].isMine).length;
		}
	}

	store.totalMines = countCells(store.board, (cell) => cell.isMine);
};

const resetGameState = (store: MinesweeperStore) => {
	store.frameCount = 0;
	store.actions = [];
	store.snapshots = [];
	store.flagsPlaced = 0;
	store.clearedSafeCells = 0;
	store.explodedMines = 0;
	store.mouse = { x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) };
	buildBoard(store);
	pushSnapshot(store);
};

const pushSnapshot = (store: MinesweeperStore, board = store.board) => {
	store.snapshots.push({
		board: cloneBoard(board),
		mouse: { ...store.mouse }
	});
	store.frameCount = store.snapshots.length - 1;
};

const getHiddenNeighbors = (store: MinesweeperStore, x: number, y: number) =>
	getNeighbors(x, y)
		.map((pos) => store.board[pos.x][pos.y])
		.filter((cell) => !cell.revealed && !cell.flagged);

const getKnownMineNeighborsCount = (store: MinesweeperStore, x: number, y: number) =>
	getNeighbors(x, y)
		.map((pos) => store.board[pos.x][pos.y])
		.filter((cell) => cell.flagged || cell.exploded).length;

const selectDeterministicMove = (store: MinesweeperStore): DeductionAction | null => {
	for (let x = 0; x < GRID_WIDTH; x++) {
		for (let y = 0; y < GRID_HEIGHT; y++) {
			const cell = store.board[x][y];
			if (!cell.revealed) continue;

			const hiddenNeighbors = getHiddenNeighbors(store, x, y);
			if (hiddenNeighbors.length === 0) continue;

			const knownMineNeighbors = getKnownMineNeighborsCount(store, x, y);
			const missingMines = Math.max(cell.adjacentMines - knownMineNeighbors, 0);

			if (missingMines === hiddenNeighbors.length) {
				const target = hiddenNeighbors[0];
				return { x: target.x, y: target.y, type: 'flag', probability: 1 };
			}

			if (missingMines === 0) {
				const target = hiddenNeighbors[0];
				return { x: target.x, y: target.y, type: 'reveal', probability: 0 };
			}
		}
	}

	return null;
};

const estimateMineProbabilities = (store: MinesweeperStore) => {
	const probabilityMap = new Map<string, number>();
	const constrained = new Set<string>();

	const unresolvedCells = listCells(store.board, (cell) => !cell.revealed && !cell.flagged);
	if (unresolvedCells.length === 0) return probabilityMap;

	const flaggedCount = countCells(store.board, (cell) => cell.flagged);
	const globalMineProbability = Math.max(0, (store.totalMines - flaggedCount) / unresolvedCells.length);

	for (const cell of unresolvedCells) {
		probabilityMap.set(`${cell.x}:${cell.y}`, globalMineProbability);
	}

	for (let x = 0; x < GRID_WIDTH; x++) {
		for (let y = 0; y < GRID_HEIGHT; y++) {
			const revealed = store.board[x][y];
			if (!revealed.revealed) continue;

			const hiddenNeighbors = getHiddenNeighbors(store, x, y);
			if (hiddenNeighbors.length === 0) continue;

			const knownMineNeighbors = getKnownMineNeighborsCount(store, x, y);
			const missingMines = Math.max(revealed.adjacentMines - knownMineNeighbors, 0);
			const localProbability = missingMines / hiddenNeighbors.length;

			for (const neighbor of hiddenNeighbors) {
				const key = `${neighbor.x}:${neighbor.y}`;
				constrained.add(key);
				const current = probabilityMap.get(key) ?? globalMineProbability;
				probabilityMap.set(key, Math.max(current, localProbability));
			}
		}
	}

	for (const cell of unresolvedCells) {
		const key = `${cell.x}:${cell.y}`;
		if (!constrained.has(key)) {
			probabilityMap.set(key, globalMineProbability);
		}
	}

	return probabilityMap;
};

const selectBestGuess = (store: MinesweeperStore): DeductionAction | null => {
	const unresolvedCells = listCells(store.board, (cell) => !cell.revealed && !cell.flagged);
	if (unresolvedCells.length === 0) return null;

	const probabilities = estimateMineProbabilities(store);
	let best = unresolvedCells[0];
	let bestProbability = probabilities.get(`${best.x}:${best.y}`) ?? 0.5;

	for (const candidate of unresolvedCells) {
		const p = probabilities.get(`${candidate.x}:${candidate.y}`) ?? 0.5;
		if (p < bestProbability || (p === bestProbability && candidate.adjacentMines < best.adjacentMines)) {
			best = candidate;
			bestProbability = p;
		}
	}

	return {
		x: best.x,
		y: best.y,
		type: 'reveal',
		probability: Math.min(Math.max(bestProbability, 0), 1)
	};
};

const revealCell = (store: MinesweeperStore, x: number, y: number, guessed: boolean, probability: number) => {
	const cell = store.board[x][y];
	if (cell.revealed || cell.flagged) return;

	if (cell.isMine) {
		cell.revealed = true;
		cell.guessed = guessed;
		cell.exploded = true;
		store.explodedMines++;
		store.actions.push({ frameIndex: store.frameCount, type: 'explode', x, y, adjacentMines: cell.adjacentMines, probability });
		return;
	}

	const queue: Position[] = [{ x, y }];
	const visited = new Set<string>();

	while (queue.length > 0) {
		const current = queue.shift() as Position;
		const key = `${current.x}:${current.y}`;
		if (visited.has(key)) continue;
		visited.add(key);

		const currentCell = store.board[current.x][current.y];
		if (currentCell.revealed || currentCell.flagged || currentCell.isMine) continue;

		currentCell.revealed = true;
		currentCell.guessed = current.x === x && current.y === y ? guessed : false;
		store.clearedSafeCells++;
		store.actions.push({
			frameIndex: store.frameCount,
			type: 'reveal',
			x: current.x,
			y: current.y,
			adjacentMines: currentCell.adjacentMines,
			probability
		});

		if (currentCell.adjacentMines !== 0) continue;

		for (const neighbor of getNeighbors(current.x, current.y)) {
			const neighborCell = store.board[neighbor.x][neighbor.y];
			if (neighborCell.revealed || neighborCell.flagged || neighborCell.isMine) continue;
			queue.push(neighbor);
		}
	}
};

const flagCell = (store: MinesweeperStore, x: number, y: number) => {
	const cell = store.board[x][y];
	if (cell.revealed || cell.flagged) return;

	cell.flagged = true;
	store.flagsPlaced++;
	store.actions.push({ frameIndex: store.frameCount, type: 'flag', x, y, adjacentMines: cell.adjacentMines, probability: 1 });
};

const isBoardSolved = (store: MinesweeperStore) =>
	listCells(store.board, () => true).every((cell) => {
		if (cell.isMine) return cell.flagged || cell.exploded || cell.revealed;
		return cell.revealed;
	});

const animateMouseMove = (store: MinesweeperStore, targetX: number, targetY: number) => {
	const startX = store.mouse.x;
	const startY = store.mouse.y;
	const deltaX = targetX - startX;
	const deltaY = targetY - startY;
	const distance = Math.hypot(deltaX, deltaY);

	if (distance === 0) return;

	const preferredSteps = Math.max(1, Math.ceil(distance * 2));
	const steps = Math.min(preferredSteps, MINESWEEPER_MAX_MOVE_FRAMES);

	for (let i = 1; i <= steps; i++) {
		const t = i / steps;
		store.mouse.x = startX + deltaX * t;
		store.mouse.y = startY + deltaY * t;
		pushSnapshot(store);
	}
};

const appendEndHoldFrames = (store: MinesweeperStore) => {
	const holdBoard = createResolvedHoldBoard(store);
	for (let i = 0; i < MINESWEEPER_END_HOLD_FRAMES; i++) {
		pushSnapshot(store, holdBoard);
	}
};

const playSingleTurn = (store: MinesweeperStore): boolean => {
	const deterministic = selectDeterministicMove(store);
	const nextMove = deterministic ?? selectBestGuess(store);
	if (!nextMove) return false;

	animateMouseMove(store, nextMove.x, nextMove.y);

	if (nextMove.type === 'flag') {
		flagCell(store, nextMove.x, nextMove.y);
	} else {
		revealCell(store, nextMove.x, nextMove.y, !deterministic, nextMove.probability);
	}

	store.config.pointsIncreasedCallback(store.clearedSafeCells);
	pushSnapshot(store);
	return true;
};

const startGame = async (store: MinesweeperStore) => {
	resetGameState(store);

	let guard = 0;
	while (!isBoardSolved(store) && guard < MINESWEEPER_MAX_STEPS) {
		const progressed = playSingleTurn(store);
		if (!progressed) break;
		guard++;
	}

	appendEndHoldFrames(store);

	const svg = Renderer.generateAnimatedSVG(store);
	store.config.svgCallback(svg);

	if (store.config.gameStatsCallback) {
		store.config.gameStatsCallback({
			totalScore: store.clearedSafeCells,
			steps: store.frameCount,
			ghostsEaten: store.explodedMines
		});
	}

	store.config.gameOverCallback();
};

const stopGame = async (store: MinesweeperStore) => {
	clearInterval(store.gameInterval as number);
};

export const Game = {
	startGame,
	stopGame
};
