import { GAME_THEMES, GRID_HEIGHT, GRID_WIDTH } from '../../shared/constants';
import { GridCell } from '../../shared/types';
import { BombermanStore } from '../types';
import { Game } from '../core/game';
import { AiController } from '../core/ai';
import { sortPathOptions } from '../core/pathfinding';
import { Renderer } from '../renderers/svg';
import { clearPlayerSpawnAreas, Player } from '../entities/player';
import { Explosion } from '../entities/explosion';
import { Bomb } from '../entities/bomb';
import { Item, ITEM_TYPE_WEIGHTS } from '../entities/item';
import { Direction, ItemType, PlayerId, Position, RoutePreference } from '../types';

const TEST_LEVELS: GridCell['level'][] = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];

const createCell = (commitsCount: number, level: GridCell['level'] = commitsCount > 0 ? 'FIRST_QUARTILE' : 'NONE'): GridCell => ({
	commitsCount,
	level,
	color: GAME_THEMES.github.intensityColors[TEST_LEVELS.indexOf(level)]
});

const createStore = (): BombermanStore => ({
	frameCount: 0,
	gameInterval: 0,
	contributions: [],
	grid: [],
	monthLabels: [],
	nextBombId: 0,
	nextItemId: 0,
	players: [],
	bombs: [],
	activeExplosions: [],
	items: [],
	gameHistory: [],
	initialColors: [],
	cellEvents: [],
	explosionEvents: [],
	config: {
		platform: 'github',
		username: '',
		gameTheme: 'github',
		githubSettings: { accessToken: '' },
		svgCallback: () => {},
		gameOverCallback: () => {},
		pointsIncreasedCallback: () => {}
	}
});

const createFilledGrid = () => Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => createCell(1)));
const createEmptyGrid = () => Array.from({ length: GRID_WIDTH }, () => Array.from({ length: GRID_HEIGHT }, () => createCell(0)));

const createPlayer = ({
	id = 1,
	name = id === 1 ? 'Bomberman' : 'Plunder Bomber',
	x = 0,
	y = 0,
	direction = id === 1 ? 'right' : 'left',
	alive = true,
	bombsPlaced = 0,
	cellsDestroyed = 0,
	blastRangeBonus = 0,
	bombCapacityBonus = 0,
	speedBonus = 0,
	movementStepProgress = 0,
	routePreference,
	attackSide,
	canKickBombs = false
}: Partial<{
	id: PlayerId;
	name: string;
	x: number;
	y: number;
	direction: Direction;
	alive: boolean;
	bombsPlaced: number;
	cellsDestroyed: number;
	blastRangeBonus: number;
	bombCapacityBonus: number;
	speedBonus: number;
	movementStepProgress: number;
	routePreference: RoutePreference;
	attackSide: 'left' | 'right';
	canKickBombs: boolean;
}> = {}) =>
	new Player(
		id,
		name,
		x,
		y,
		direction,
		alive,
		bombsPlaced,
		cellsDestroyed,
		blastRangeBonus,
		bombCapacityBonus,
		speedBonus,
		movementStepProgress,
		attackSide,
		routePreference,
		canKickBombs
	);

const createItem = ({
	id = 0,
	type = 'blast-range',
	x = 0,
	y = 0,
	hidden = false,
	collected = false,
	destroyed = false
}: Partial<{ id: number; type: ItemType; x: number; y: number; hidden: boolean; collected: boolean; destroyed: boolean }> = {}) =>
	new Item(id, type, x, y, hidden, collected, destroyed);

const createExplosion = ({
	bombId = 0,
	ownerId = 1,
	x = 0,
	y = 0,
	blastRange = 1,
	remainingFrames = 2,
	affectedCells = [],
	hitPlayerIds = []
}: Partial<{
	bombId: number;
	ownerId: PlayerId;
	x: number;
	y: number;
	blastRange: number;
	remainingFrames: number;
	affectedCells: Position[];
	hitPlayerIds: PlayerId[];
}> = {}) => new Explosion(bombId, ownerId, x, y, blastRange, affectedCells, remainingFrames, hitPlayerIds);

describe('Bomberman spawn handling', () => {
	it('clears every contribution cell in a 2x2 spawn area without scoring an event', () => {
		const store = createStore();
		store.grid = createFilledGrid();

		clearPlayerSpawnAreas(store);

		expect(store.grid[0][0]).toEqual(createCell(0));
		expect(store.grid[1][0]).toEqual(createCell(0));
		expect(store.grid[0][1]).toEqual(createCell(0));
		expect(store.grid[1][1]).toEqual(createCell(0));
		expect(store.grid[GRID_WIDTH - 2][GRID_HEIGHT - 2]).toEqual(createCell(0));
		expect(store.grid[GRID_WIDTH - 1][GRID_HEIGHT - 2]).toEqual(createCell(0));
		expect(store.grid[GRID_WIDTH - 2][GRID_HEIGHT - 1]).toEqual(createCell(0));
		expect(store.grid[GRID_WIDTH - 1][GRID_HEIGHT - 1]).toEqual(createCell(0));
		expect(store.grid[2][0]).toEqual(createCell(1));
		expect(store.cellEvents).toHaveLength(0);
	});

	it('places players at fixed opposite corners', async () => {
		const store = createStore();

		await Game.startGame(store);

		expect(store.gameHistory[0].players[0]).toMatchObject({ id: 1, x: 0, y: 0 });
		expect(store.gameHistory[0].players[1]).toMatchObject({ id: 2, x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 });
	});

	it('keeps players moving and fighting when the grid has no contributions', async () => {
		const store = createStore();

		await Game.startGame(store);

		const initialSnapshot = store.gameHistory[0];
		const moved = store.players.some((player) => {
			const initialPlayer = initialSnapshot.players.find((candidate) => candidate.id === player.id);
			return initialPlayer && (player.x !== initialPlayer.x || player.y !== initialPlayer.y);
		});

		expect(store.frameCount).toBeGreaterThan(0);
		expect(moved).toBe(true);
		expect(store.players.some((player) => player.bombsPlaced > 0)).toBe(true);
	});
});

describe('Bomberman movement AI', () => {
	it('uses the player route preference to vary equal-length chase paths', () => {
		const createChaseStore = (routePreference: 'horizontal-first' | 'vertical-first') => {
			const store = createStore();
			store.grid = createEmptyGrid();
			store.players = [
				createPlayer({ id: 1, x: 0, y: 0, direction: 'right', routePreference }),
				createPlayer({ id: 2, x: 2, y: 2, direction: 'left' })
			];
			return store;
		};

		const horizontalStore = createChaseStore('horizontal-first');
		const verticalStore = createChaseStore('vertical-first');

		new AiController(horizontalStore, horizontalStore.players[0]).movePlayer();
		new AiController(verticalStore, verticalStore.players[0]).movePlayer();

		expect(horizontalStore.players[0]).toMatchObject({ x: 1, y: 0, direction: 'right' });
		expect(verticalStore.players[0]).toMatchObject({ x: 0, y: 1, direction: 'down' });
	});

	it('uses the attack side as a tie breaker for equivalent path options', () => {
		const options = {
			origin: { x: 2, y: 1 },
			routePreference: 'horizontal-first' as const,
			target: { x: 2, y: 2 }
		};

		const leftFirst = sortPathOptions(
			[
				{ x: 3, y: 1 },
				{ x: 1, y: 1 }
			],
			{ ...options, attackSide: 'left' }
		);
		const rightFirst = sortPathOptions(
			[
				{ x: 1, y: 1 },
				{ x: 3, y: 1 }
			],
			{ ...options, attackSide: 'right' }
		);

		expect(leftFirst[0]).toEqual({ x: 1, y: 1 });
		expect(rightFirst[0]).toEqual({ x: 3, y: 1 });
	});
});

describe('Bomberman explosion handling', () => {
	it('kills players standing in an active explosion after the initial blast frame', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.players = [createPlayer({ id: 1, x: 1, y: 0, direction: 'right' }), createPlayer({ id: 2, x: 2, y: 0, direction: 'left' })];
		store.activeExplosions = [
			createExplosion({
				ownerId: 1,
				affectedCells: [
					{ x: 0, y: 0 },
					{ x: 1, y: 0 }
				]
			})
		];

		for (const player of store.players) {
			if (!player.alive) continue;
			for (const explosion of store.activeExplosions) {
				if (explosion.contains(player)) {
					player.kill();
					explosion.markPlayerHit(player.id);
					break;
				}
			}
		}

		expect(store.players[0].alive).toBe(false);
		expect(store.players[1].alive).toBe(true);
		expect(store.activeExplosions[0].hitPlayerIds).toEqual([1]);
	});

	it('does not move a player into their own active explosion while chasing', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right' }), createPlayer({ id: 2, x: 2, y: 0, direction: 'left' })];
		store.activeExplosions = [
			createExplosion({
				ownerId: 1,
				x: 1,
				y: 0,
				affectedCells: [{ x: 1, y: 0 }]
			})
		];

		new AiController(store, store.players[0]).movePlayer();

		expect(store.players[0]).not.toMatchObject({ x: 1, y: 0 });
		expect(store.players[0].alive).toBe(true);
	});

	it('does not move a player into any active explosion while chasing', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right' }), createPlayer({ id: 2, x: 2, y: 0, direction: 'left' })];
		store.activeExplosions = [
			createExplosion({
				ownerId: 2,
				x: 1,
				y: 0,
				affectedCells: [{ x: 1, y: 0 }]
			})
		];

		new AiController(store, store.players[0]).movePlayer();

		expect(store.players[0]).not.toMatchObject({ x: 1, y: 0 });
		expect(store.players[0].alive).toBe(true);
	});

	it('plants a bomb for item hunting when the direct route to the opponent is already clear', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.grid[1][1] = createCell(1);
		store.players = [createPlayer({ id: 1, x: 1, y: 0, direction: 'right' }), createPlayer({ id: 2, x: 4, y: 0, direction: 'left' })];

		const ai = new AiController(store, store.players[0]);

		expect(ai.shouldPlaceBomb()).toBe(true);
		store.players[0].placeBomb(store);
		store.bombs[0].explode(store);

		expect(store.grid[1][1]).toEqual(createCell(0));
	});

	it('moves toward a route-adjacent item hunt bomb spot before chasing on a clear route', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.grid[2][1] = createCell(1);
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right' }), createPlayer({ id: 2, x: 4, y: 0, direction: 'left' })];

		new AiController(store, store.players[0]).movePlayer();

		expect(store.players[0]).toMatchObject({ x: 0, y: 1, direction: 'down' });
		new AiController(store, store.players[0]).movePlayer();
		expect(store.players[0]).toMatchObject({ x: 1, y: 1, direction: 'right' });
		expect(new AiController(store, store.players[0]).shouldPlaceBomb()).toBe(true);
	});

	it('prioritizes high drop chance contribution cells when hunting for items', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		const lowChanceCell = { x: 1, y: 1 };
		const highChanceCell = { x: 5, y: 1 };
		store.grid[lowChanceCell.x][lowChanceCell.y] = createCell(1, 'FIRST_QUARTILE');
		store.grid[highChanceCell.x][highChanceCell.y] = createCell(8, 'FOURTH_QUARTILE');
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right' }), createPlayer({ id: 2, x: 8, y: 0, direction: 'left' })];

		for (let move = 0; move < 8 && store.bombs.length === 0; move++) {
			const ai = new AiController(store, store.players[0]);
			if (store.players[0].canPlaceBomb(store) && ai.shouldPlaceBomb()) {
				store.players[0].placeBomb(store);
			} else {
				ai.movePlayer();
			}
		}

		expect(store.bombs).toHaveLength(1);
		expect(store.bombs[0].getBlastCells(store)).toEqual(expect.arrayContaining([highChanceCell]));
		expect(store.bombs[0].getBlastCells(store)).not.toEqual(expect.arrayContaining([lowChanceCell]));
	});

	it('does not use route item hunting when no direct path to the opponent is open', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.grid[1][0] = createCell(1);
		store.grid[0][1] = createCell(1);
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right' }), createPlayer({ id: 2, x: 4, y: 0, direction: 'left' })];

		const ai = new AiController(store, store.players[0]);

		expect(ai.shouldPlaceBomb()).toBe(false);
	});

	it('reveals hidden items when their contribution cell is destroyed', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.grid[1][0] = createCell(1);
		store.items = [createItem({ type: 'blast-range', x: 1, y: 0, hidden: true })];
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right' })];

		store.players[0].placeBomb(store);
		store.bombs[0].explode(store);

		expect(store.items[0].hidden).toBe(false);
		expect(store.grid[1][0]).toEqual(createCell(0));
	});

	it('applies blast range bonus on pickup and increases subsequent bomb range', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.items = [createItem({ type: 'blast-range', x: 1, y: 0 })];
		store.players = [createPlayer({ id: 1, x: 1, y: 0, direction: 'right' })];

		Item.collectVisibleAt(store, store.players[0]);
		store.grid[3][0] = createCell(1);
		store.players[0].placeBomb(store);
		store.bombs[0].explode(store);

		expect(store.items[0].collected).toBe(true);
		expect(store.players[0].blastRangeBonus).toBe(1);
		expect(store.bombs[0].blastRange).toBe(2);
		expect(store.grid[3][0]).toEqual(createCell(0));
	});

	it('triggers chained explosions when a bomb is hit by another explosion', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right', bombCapacityBonus: 1 })];

		// Place bomb at (0,0)
		store.players[0].placeBomb(store);
		// Place another bomb at (1,0)
		store.players[0].x = 1;
		store.players[0].placeBomb(store);

		// Explode first bomb at (0,0)
		store.bombs[0].explode(store);

		expect(store.bombs[0].exploded).toBe(true);
		expect(store.bombs[1].exploded).toBe(true);
		expect(store.activeExplosions).toHaveLength(2);
	});

	it('applies 5% speed on pickup and adds one extra move every twentieth frame', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.items = [createItem({ type: 'speed', x: 0, y: 0 })];
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right', speedBonus: 0, movementStepProgress: 0 })];

		Item.collectVisibleAt(store, store.players[0]);

		expect(store.items[0]).toMatchObject({ collected: true });
		expect(store.players[0].speedBonus).toBe(5);
		expect(Array.from({ length: 20 }, () => store.players[0].nextMoveCount())).toEqual([
			1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2
		]);
	});

	it('applies bomb capacity on pickup and allows one additional active bomb', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.items = [createItem({ type: 'bomb-capacity', x: 0, y: 0 })];
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right', bombCapacityBonus: 0 })];

		Item.collectVisibleAt(store, store.players[0]);
		store.players[0].placeBomb(store);
		store.players[0].x = 1;
		store.players[0].placeBomb(store);
		store.players[0].x = 2;
		store.players[0].placeBomb(store);

		expect(store.items[0]).toMatchObject({ collected: true });
		expect(store.players[0].bombCapacityBonus).toBe(1);
		expect(store.players[0].bombsPlaced).toBe(2);
		expect(store.bombs).toHaveLength(2);
	});

	it('applies bomb kick on pickup and lets the player kick blocking bombs while moving', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.items = [createItem({ type: 'bomb-kick', x: 0, y: 0 })];
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right' }), createPlayer({ id: 2, x: 4, y: 0, direction: 'left' })];
		store.bombs = [new Bomb(0, 2, 1, 0, 1)];

		Item.collectVisibleAt(store, store.players[0]);
		new AiController(store, store.players[0]).movePlayer();

		expect(store.items[0]).toMatchObject({ collected: true });
		expect(store.players[0]).toMatchObject({ x: 1, y: 0, direction: 'right', canKickBombs: true });
		expect(store.bombs[0]).toMatchObject({ x: 2, y: 0, kickDirection: 'right', kickMoveCooldown: 2 });

		store.bombs[0].tick(store);
		expect(store.bombs[0]).toMatchObject({ x: 2, y: 0, kickMoveCooldown: 1 });

		store.bombs[0].tick(store);
		expect(store.bombs[0]).toMatchObject({ x: 3, y: 0, kickMoveCooldown: 2 });
	});

	it('keeps the player blocked when a bomb cannot be kicked into the next cell', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.grid[2][0] = createCell(1);
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right', canKickBombs: true })];
		store.bombs = [new Bomb(0, 1, 1, 0, 1)];

		const kicked = store.players[0].kickBomb(store, store.bombs[0], 'right');

		expect(kicked).toBe(false);
		expect(store.players[0]).toMatchObject({ x: 0, y: 0 });
		expect(store.bombs[0]).toMatchObject({ x: 1, y: 0 });
	});

	it('does not kick a bomb from the same cell without moving into it', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.players = [
			createPlayer({ id: 1, x: 0, y: 0, direction: 'right', canKickBombs: true }),
			createPlayer({ id: 2, x: GRID_WIDTH - 2, y: 0, direction: 'left' })
		];

		const ai = new AiController(store, store.players[0]);
		expect(ai.shouldPlaceBomb()).toBe(false);

		store.players[0].placeBomb(store);
		expect(store.players[0].kickBomb(store, store.bombs[0], 'right')).toBe(false);
		ai.movePlayer();

		expect(store.players[0]).toMatchObject({ x: 0, y: 1, direction: 'down' });
		expect(store.bombs[0]).toMatchObject({ x: 0, y: 0, kickDirection: undefined });
	});

	it('does not directly kick a placed bomb when the kicked bomb traps the player', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.grid[0][1] = createCell(1);
		store.grid[1][1] = createCell(1);
		store.grid[3][0] = createCell(1);
		store.players = [
			createPlayer({ id: 1, x: 0, y: 0, direction: 'right', blastRangeBonus: 1, canKickBombs: true }),
			createPlayer({ id: 2, x: 5, y: 0, direction: 'left' })
		];
		store.bombs = [new Bomb(0, 1, 0, 0, 2)];

		new AiController(store, store.players[0]).movePlayer();

		expect(store.bombs[0]).toMatchObject({ x: 0, y: 0, kickDirection: undefined });
	});

	it('does not kick an adjacent bomb when the player cannot escape the kicked bomb blast', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.grid[0][1] = createCell(1);
		store.grid[3][0] = createCell(1);
		store.players = [
			createPlayer({ id: 1, x: 0, y: 0, direction: 'right', canKickBombs: true }),
			createPlayer({ id: 2, x: 5, y: 0, direction: 'left' })
		];
		store.bombs = [new Bomb(0, 1, 1, 0, 2)];

		new AiController(store, store.players[0]).movePlayer();

		expect(store.players[0]).toMatchObject({ x: 0, y: 0 });
		expect(store.bombs[0]).toMatchObject({ x: 1, y: 0, kickDirection: undefined });
	});

	it('spawns bomb kick items less often than regular item types', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.grid[0][0] = createCell(1);
		const random = jest.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.95);

		try {
			Item.createHiddenItems(store);
		} finally {
			random.mockRestore();
		}

		expect(ITEM_TYPE_WEIGHTS['bomb-kick']).toBeLessThan(ITEM_TYPE_WEIGHTS.speed);
		expect(store.items).toHaveLength(1);
		expect(store.items[0]).toMatchObject({ type: 'bomb-kick' });
	});

	it('raises per-cell item drop chance when few high-value spawn blocks are available', () => {
		const sparseStore = createStore();
		sparseStore.grid = createEmptyGrid();
		sparseStore.grid[0][0] = { ...createCell(1), level: 'FOURTH_QUARTILE' };
		const sparseRandom = jest.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0);

		try {
			Item.createHiddenItems(sparseStore);
		} finally {
			sparseRandom.mockRestore();
		}

		const denseStore = createStore();
		denseStore.grid = Array.from({ length: GRID_WIDTH }, () =>
			Array.from({ length: GRID_HEIGHT }, () => ({ ...createCell(1), level: 'FOURTH_QUARTILE' as const }))
		);
		const denseRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);

		try {
			Item.createHiddenItems(denseStore);
		} finally {
			denseRandom.mockRestore();
		}

		expect(sparseStore.items).toHaveLength(1);
		expect(denseStore.items).toHaveLength(0);
	});

	it('stops an upgraded bomb blast at the first contribution block in each direction', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.grid[1][0] = createCell(1);
		store.grid[2][0] = createCell(1);
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right', blastRangeBonus: 2 })];

		store.players[0].placeBomb(store);
		store.bombs[0].explode(store);

		expect(store.bombs[0].blastRange).toBe(3);
		expect(store.grid[1][0]).toEqual(createCell(0));
		expect(store.grid[2][0]).toEqual(createCell(1));
	});

	it('destroys visible items hit by a bomb blast', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.items = [createItem({ type: 'blast-range', x: 1, y: 0 })];
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right' })];

		store.players[0].placeBomb(store);
		store.bombs[0].explode(store);
		store.players[0].moveTo({ x: 1, y: 0 });
		Item.collectVisibleAt(store, store.players[0]);

		expect(store.items[0]).toMatchObject({ destroyed: true, collected: false });
		expect(store.players[0].blastRangeBonus).toBe(0);
	});

	it('avoids blasting visible items and prioritizes walking toward them', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.items = [createItem({ type: 'blast-range', x: 0, y: 1 })];
		store.players = [createPlayer({ id: 1, x: 0, y: 0, direction: 'right' }), createPlayer({ id: 2, x: 2, y: 0, direction: 'left' })];

		const ai = new AiController(store, store.players[0]);
		expect(ai.shouldPlaceBomb()).toBe(false);

		ai.movePlayer();

		Item.collectVisibleAt(store, store.players[0]);

		expect(store.players[0]).toMatchObject({ x: 0, y: 1, blastRangeBonus: 1 });
		expect(store.items[0]).toMatchObject({ collected: true, destroyed: false });
	});
});

describe('Bomberman SVG renderer', () => {
	it('renders static blast sprites without animated href cycles', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));
		store.monthLabels = Array.from({ length: GRID_WIDTH }, () => '');

		const explosion = {
			bombId: 0,
			ownerId: 1 as const,
			x: 1,
			y: 1,
			blastRange: 1,
			remainingFrames: 4,
			affectedCells: [
				{ x: 1, y: 1 },
				{ x: 2, y: 1 }
			],
			hitPlayerIds: [],
			frameIndex: 1
		};
		store.explosionEvents = [explosion];
		store.gameHistory = Array.from({ length: 5 }, () => ({
			players: [],
			bombs: [],
			explosions: [],
			items: []
		}));

		const svg = Renderer.generateAnimatedSVG(store);

		expect(svg).toContain('id="bm-explosion-shape-');
		expect(svg).toContain('href="#bm-explosion-shape-');
		expect(svg).toContain('id="bm-blast-center-0"');
		expect(svg).toContain('id="bm-blast-segment-0"');
		expect(svg).toContain('href="#bm-blast-center-');
		expect(svg).not.toContain('bm-blast-center-cycle');
		expect(svg).not.toContain('<animate attributeName="href"');
	});

	it('animates bombs through static opacity-switched sprites', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));
		store.monthLabels = Array.from({ length: GRID_WIDTH }, () => '');
		store.gameHistory = Array.from({ length: 2 }, () => ({
			players: [],
			bombs: [{ id: 0, ownerId: 1, x: 1, y: 1, timer: 1, exploded: false, blastRange: 1 }],
			explosions: [],
			items: []
		}));

		const svg = Renderer.generateAnimatedSVG(store);

		expect(svg).toContain('id="bomb-0"');
		expect(svg).toContain('<animate attributeName="opacity" calcMode="discrete" dur="500ms"');
		expect(svg).not.toContain('<animateTransform attributeName="transform" type="scale"');
		expect(svg).not.toContain('<animate attributeName="href"');
	});

	it('keeps disappeared kicked bombs at their last position in the x timeline', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));
		store.monthLabels = Array.from({ length: GRID_WIDTH }, () => '');
		store.gameHistory = [
			{
				players: [],
				bombs: [{ id: 0, ownerId: 1, x: 0, y: 0, timer: 4, exploded: false, blastRange: 1 }],
				explosions: [],
				items: []
			},
			{
				players: [],
				bombs: [{ id: 0, ownerId: 1, x: 1, y: 0, timer: 3, exploded: false, blastRange: 1 }],
				explosions: [],
				items: []
			},
			{
				players: [],
				bombs: [{ id: 0, ownerId: 1, x: 2, y: 0, timer: 2, exploded: false, blastRange: 1 }],
				explosions: [],
				items: []
			},
			{
				players: [],
				bombs: [{ id: 1, ownerId: 1, x: 0, y: 0, timer: 4, exploded: false, blastRange: 1 }],
				explosions: [],
				items: []
			},
			{ players: [], bombs: [{ id: 1, ownerId: 1, x: 0, y: 0, timer: 3, exploded: false, blastRange: 1 }], explosions: [], items: [] }
		];

		const svg = Renderer.generateAnimatedSVG(store);
		const oldBombSvg = svg.match(/<g id="bomb-0"[\s\S]*?<\/g>/)?.[0] ?? '';

		expect(oldBombSvg).toContain('attributeName="x" calcMode="linear"');
		expect(oldBombSvg).toContain('values="2;24;46;46"');
		expect(oldBombSvg).not.toContain('46;2');
		expect(oldBombSvg).not.toContain('<animateTransform attributeName="transform" type="translate"');
	});

	it('smoothly interpolates rolling bomb movement across repeated position frames', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));
		store.monthLabels = Array.from({ length: GRID_WIDTH }, () => '');
		store.gameHistory = [
			{
				players: [],
				bombs: [{ id: 0, ownerId: 1, x: 0, y: 0, timer: 5, exploded: false, blastRange: 1 }],
				explosions: [],
				items: []
			},
			{
				players: [],
				bombs: [{ id: 0, ownerId: 1, x: 0, y: 0, timer: 4, exploded: false, blastRange: 1 }],
				explosions: [],
				items: []
			},
			{
				players: [],
				bombs: [{ id: 0, ownerId: 1, x: 1, y: 0, timer: 3, exploded: false, blastRange: 1 }],
				explosions: [],
				items: []
			},
			{
				players: [],
				bombs: [{ id: 0, ownerId: 1, x: 1, y: 0, timer: 2, exploded: false, blastRange: 1 }],
				explosions: [],
				items: []
			},
			{ players: [], bombs: [{ id: 0, ownerId: 1, x: 2, y: 0, timer: 1, exploded: false, blastRange: 1 }], explosions: [], items: [] }
		];

		const svg = Renderer.generateAnimatedSVG(store);
		const bombSvg = svg.match(/<g id="bomb-0"[\s\S]*?<\/g>/)?.[0] ?? '';

		expect(bombSvg).toContain('attributeName="x" calcMode="linear"');
		expect(bombSvg).toContain('keyTimes="0;0.5;1" values="2;24;46"');
		expect(bombSvg).not.toContain('keyTimes="0;0.25;0.5;0.75;1"');
		expect(bombSvg).not.toContain('<animateTransform attributeName="transform" type="translate"');
	});

	it('starts newly kicked bomb animations at the kick source cell', () => {
		const store = createStore();
		store.grid = createEmptyGrid();
		store.initialColors = store.grid.map((col) => col.map((cell) => cell.color));
		store.monthLabels = Array.from({ length: GRID_WIDTH }, () => '');
		store.gameHistory = [
			{
				players: [{ ...createPlayer({ id: 1, x: 0, y: 0, direction: 'right', canKickBombs: true }) }],
				bombs: [
					{ id: 0, ownerId: 1, x: 1, y: 0, timer: 4, exploded: false, blastRange: 1, kickDirection: 'right', kickMoveCooldown: 2 }
				],
				explosions: [],
				items: []
			},
			{
				players: [{ ...createPlayer({ id: 1, x: 0, y: 0, direction: 'right', canKickBombs: true }) }],
				bombs: [
					{ id: 0, ownerId: 1, x: 1, y: 0, timer: 3, exploded: false, blastRange: 1, kickDirection: 'right', kickMoveCooldown: 1 }
				],
				explosions: [],
				items: []
			}
		];

		const svg = Renderer.generateAnimatedSVG(store);
		const bombSvg = svg.match(/<g id="bomb-0"[\s\S]*?<\/g>/)?.[0] ?? '';

		expect(bombSvg).toContain('attributeName="x" calcMode="linear"');
		expect(bombSvg).toContain('values="2;24"');
		expect(bombSvg).not.toContain('x="24"');
	});
});
