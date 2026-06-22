import { Providers } from '../shared/providers/providers';
import { Utils } from '../shared/utils/utils';
import { Game } from './core/game';
import { storeTemplate } from './core/store';
import type { BombermanConfig, BombermanStore } from './types';

export { BombermanConfig } from './types';

export class BombermanRenderer {
	store!: BombermanStore;

	constructor(public conf: BombermanConfig) {}

	public async start() {
		const defaultConfig: BombermanConfig = {
			platform: 'github',
			username: '',
			svgCallback: (_: string) => {},
			gameOverCallback: () => {},
			gameTheme: 'github',
			pointsIncreasedCallback: (_: number) => {},
			githubSettings: { accessToken: '' }
		};

		this.store = JSON.parse(JSON.stringify(storeTemplate));
		this.store.config = { ...defaultConfig, ...this.conf };
		this.store.contributions = await Providers.fetchContributions(this.store);

		Utils.buildMonthLabels(this.store);

		await Game.startGame(this.store);
		return this.store;
	}

	public stop() {
		Game.stopGame(this.store);
	}
}
