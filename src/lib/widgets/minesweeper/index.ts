import { Game } from '../minesweeper/core/game';
import { Store } from '../minesweeper/core/store';
import type { MinesweeperConfig, MinesweeperStore } from '../minesweeper/types';
import { Providers } from '../shared/providers/providers';
import { Utils } from '../shared/utils/utils';

export type { MinesweeperConfig } from '../minesweeper/types';

export class MinesweeperRenderer {
	store!: MinesweeperStore;
	conf: MinesweeperConfig;

	constructor(conf: MinesweeperConfig) {
		this.conf = { ...conf };
	}

	public async start() {
		const defaultConfig: MinesweeperConfig = {
			platform: 'github',
			username: '',
			svgCallback: (_: string) => {},
			gameOverCallback: () => {},
			gameTheme: 'github',
			pointsIncreasedCallback: (_: number) => {},
			githubSettings: { accessToken: '' }
		};

		this.store = JSON.parse(JSON.stringify(Store));
		this.store.config = { ...defaultConfig, ...this.conf };

		this.store.contributions = await Providers.fetchContributions(this.store);

		Utils.buildGrid(this.store);
		Utils.buildMonthLabels(this.store);

		await Game.startGame(this.store);
		return this.store;
	}

	public stop() {
		Game.stopGame(this.store);
	}
}
