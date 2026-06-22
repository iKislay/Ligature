import { Utils } from '../../shared/utils/utils';
import { Renderer } from '../renderers/svg';
import { BombermanStore } from '../types';
import { DEATH_ANIMATION_FRAMES, MAX_FRAMES } from './constants';
import { AiController } from './ai';
import { Item } from '../entities/item';
import { clearPlayerSpawnAreas, placePlayers } from '../entities/player';
import { GameState } from './state';

export class GameEngine {
	constructor(private readonly store: BombermanStore) {}

	async start() {
		this.resetState();

		this.store.grid = Utils.createGridFromData(this.store);
		clearPlayerSpawnAreas(this.store);
		this.store.initialColors = this.store.grid.map((col) => col.map((cell) => cell.color));
		Item.createHiddenItems(this.store);
		placePlayers(this.store);
		this.pushSnapshot();

		while (this.alivePlayerCount() > 1 && this.store.frameCount < MAX_FRAMES) {
			this.update();
		}

		this.appendDeathAnimationSnapshots();
		this.finish();
	}

	stop() {
		clearInterval(this.store.gameInterval as number);
	}

	pushSnapshot() {
		this.store.gameHistory.push({
			players: this.store.players.map((player) => ({ ...player })),
			bombs: this.store.bombs.map((bomb) => ({ ...bomb })),
			explosions: this.store.activeExplosions.map((explosion) => ({
				...explosion,
				affectedCells: explosion.affectedCells.map((cell) => ({ ...cell })),
				hitPlayerIds: [...explosion.hitPlayerIds]
			})),
			items: this.store.items.map((item) => ({ ...item }))
		});
	}

	private update() {
		this.store.frameCount++;

		this.updateExplosions();
		this.updateBombs();
		this.killPlayersInActiveExplosions();

		for (const player of this.store.players) {
			if (!player.alive) continue;
			const ai = new AiController(this.store, player);

			if (player.canPlaceBomb(this.store) && ai.shouldPlaceBomb()) {
				player.placeBomb(this.store);
			}

			const moveCount = player.nextMoveCount();
			for (let moveIndex = 0; moveIndex < moveCount && player.alive; moveIndex++) {
				ai.movePlayer();
				Item.collectVisibleAt(this.store, player);
				this.killPlayersInActiveExplosions();
			}
		}

		this.pushSnapshot();
	}

	private updateExplosions() {
		for (const explosion of this.store.activeExplosions) {
			explosion.tick();
		}
		this.store.activeExplosions = this.store.activeExplosions.filter((explosion) => explosion.remainingFrames > 0);
	}

	private updateBombs() {
		for (const bomb of this.store.bombs) {
			bomb.tick(this.store);
		}

		for (const bomb of [...this.store.bombs]) {
			if (!bomb.exploded && bomb.timer <= 0) bomb.explode(this.store);
		}

		this.store.bombs = this.store.bombs.filter((bomb) => !bomb.exploded);
	}

	private killPlayersInActiveExplosions() {
		for (const player of this.store.players) {
			if (!player.alive) continue;

			for (const explosion of this.store.activeExplosions) {
				if (!explosion.contains(player)) continue;

				player.kill();
				explosion.markPlayerHit(player.id);
				break;
			}
		}
	}

	private appendDeathAnimationSnapshots() {
		if (this.store.players.every((player) => player.alive)) return;

		for (let frame = 1; frame < DEATH_ANIMATION_FRAMES; frame++) {
			this.updateExplosions();
			this.pushSnapshot();
		}
	}

	private resetState() {
		GameState.from(this.store).reset();
	}

	private finish() {
		const svg = Renderer.generateAnimatedSVG(this.store);
		this.store.config.svgCallback(svg);

		if (this.store.config.gameStatsCallback) {
			this.store.config.gameStatsCallback({
				totalScore: this.store.cellEvents.length,
				steps: this.store.frameCount,
				ghostsEaten: 0
			});
		}

		this.store.config.gameOverCallback();
	}

	private alivePlayerCount() {
		return this.store.players.filter((player) => player.alive).length;
	}
}

const stopGame = async (store: BombermanStore) => new GameEngine(store).stop();

const startGame = async (store: BombermanStore) => new GameEngine(store).start();

export const Game = {
	startGame,
	stopGame
};
