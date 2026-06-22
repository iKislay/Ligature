import { Providers } from '../shared/providers/providers';
import { Utils } from '../shared/utils/utils';
import { BreakoutGame } from './core/game';
import { BreakoutStore } from './core/store';
import { BreakoutConfig, BreakoutStoreType } from './types';

export { BreakoutConfig } from './types';

export class BreakoutRenderer {
	store!: BreakoutStoreType;
	conf: BreakoutConfig;

	constructor(conf: BreakoutConfig) {
		this.conf = { ...conf };
	}

	public async start() {
		const defaultConfig: BreakoutConfig = {
			platform: 'github',
			username: '',
			svgCallback: (_: string) => {},
			gameOverCallback: () => {},
			gameTheme: 'github',
			pointsIncreasedCallback: (_: number) => {},
			githubSettings: { accessToken: '' }
		};

		this.store = JSON.parse(JSON.stringify(BreakoutStore));
		this.store.config = { ...defaultConfig, ...this.conf };
		this.store.contributions = await Providers.fetchContributions(this.store);

		Utils.buildGrid(this.store);
		Utils.buildMonthLabels(this.store);

		await BreakoutGame.startGame(this.store);
		return this.store;
	}

	public stop() {
		BreakoutGame.stopGame(this.store);
	}
}
