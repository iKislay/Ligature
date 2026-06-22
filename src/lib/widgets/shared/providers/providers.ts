import { fetchGithubContributions } from './github-contributions';
import { fetchGitlabContributions } from './gitlab-contributions';
import { generateScenarioContributions } from './scenarios';
import type { BaseStore, Contribution } from '../types';

const fetchScenarioContributions = async (store: BaseStore): Promise<Contribution[]> =>
	generateScenarioContributions(store.config.scenario).contributions;

const fetchContributions = async (store: BaseStore): Promise<Contribution[]> => {
	switch (store.config.platform) {
		case 'gitlab':
			return await fetchGitlabContributions(store);
		case 'github':
			return await fetchGithubContributions(store);
		case 'scenario':
			return await fetchScenarioContributions(store);
		default:
			throw new Error(`Unsupported platform: ${store.config.platform}`);
	}
};

export const Providers = {
	fetchContributions,
	fetchGithubContributions,
	fetchGitlabContributions,
	fetchScenarioContributions,
	generateScenarioContributions
};
