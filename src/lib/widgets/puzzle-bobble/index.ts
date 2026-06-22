import { Providers } from '../shared/providers/providers';
import { Utils } from '../shared/utils/utils';
import { PuzzleBobbleGame } from './core/game';
import { PuzzleBobbleStore } from './core/store';
import { PBConfig, PBStoreType } from './types';

export { PBConfig as PuzzleBobbleConfig } from './types';

export class PuzzleBobbleRenderer {
	store!: PBStoreType;
	conf: PBConfig;

	constructor(conf: PBConfig) {
		this.conf = { ...conf };
	}

	public async start() {
		const defaultConfig: PBConfig = {
			platform: 'github',
			username: '',
			svgCallback: (_: string) => {},
			gameOverCallback: () => {},
			gameTheme: 'github',
			pointsIncreasedCallback: (_: number) => {},
			githubSettings: { accessToken: '' }
		};

		this.store = JSON.parse(JSON.stringify(PuzzleBobbleStore));
		this.store.config = { ...defaultConfig, ...this.conf };
		this.store.contributions = await Providers.fetchContributions(this.store);

		Utils.buildGrid(this.store);
		Utils.buildMonthLabels(this.store);

		await PuzzleBobbleGame.startGame(this.store);
		return this.store;
	}

	public stop() {
		PuzzleBobbleGame.stopGame(this.store);
	}
}
