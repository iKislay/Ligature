import { Providers } from '../shared/providers/providers';
import { Utils } from '../shared/utils/utils';
import { GalagaGame } from './core/game';
import { GalagaStore } from './core/store';
import { GalagaConfig, GalagaStoreType } from './types';

export { GalagaConfig } from './types';

export class GalagaRenderer {
	store!: GalagaStoreType;
	conf: GalagaConfig;

	constructor(conf: GalagaConfig) {
		this.conf = { ...conf };
	}

	public async start() {
		const defaultConfig: GalagaConfig = {
			platform: 'github',
			username: '',
			svgCallback: (_: string) => {},
			gameOverCallback: () => {},
			gameTheme: 'github',
			pointsIncreasedCallback: (_: number) => {},
			githubSettings: { accessToken: '' }
		};

		this.store = JSON.parse(JSON.stringify(GalagaStore));
		this.store.config = { ...defaultConfig, ...this.conf };
		this.store.contributions = await Providers.fetchContributions(this.store);

		Utils.buildGrid(this.store);
		Utils.buildMonthLabels(this.store);

		await GalagaGame.startGame(this.store);
		return this.store;
	}

	public stop() {
		GalagaGame.stopGame(this.store);
	}
}
