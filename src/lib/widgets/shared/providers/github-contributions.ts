import { BaseStore, Contribution, ContributionLevel } from '../types';
import { calculateContributionLevel, getCurrentTheme, levelToIndex } from '../utils/utils';
import { githubFetch } from '@/lib/github-client';

interface ContributionDay {
	date: string;
	contributionCount: number;
	color: string;
	contributionLevel: ContributionLevel;
}

interface GraphQLResponse {
	data: {
		user: {
			contributionsCollection: {
				contributionCalendar: {
					weeks: {
						contributionDays: ContributionDay[];
					}[];
				};
			};
		};
	};
}

export const fetchGithubContributions = async (store: BaseStore): Promise<Contribution[]> => {
	if (store.config.githubSettings?.accessToken) {
		return await fetchGithubContributionsGraphQL(store);
	} else {
		return await fetchGithubContributionsRest(store);
	}
};

interface CommitItem {
	commit: {
		author?: { date?: string };
		committer?: { date?: string };
	};
}

const fetchGithubContributionsRest = async (store: BaseStore): Promise<Contribution[]> => {
	const token = store.config.githubSettings?.accessToken ?? '';
	const commits: CommitItem[] = [];
	let isComplete = false;
	let page = 1;

	do {
		try {
			const response = await githubFetch(
				token,
				`https://api.github.com/search/commits?q=author:${store.config.username}&sort=author-date&order=desc&page=${page}&per_page=100`
			);
			const data = (await response.json()) as { items?: CommitItem[] };
			isComplete = !data.items || data.items.length === 0;
			commits.push(...(data.items ?? []));
			page++;
		} catch {
			isComplete = true;
		}
	} while (!isComplete);

	const contributions = Array.from(
		commits
			.reduce((map, item) => {
				const authorDateStr = item.commit.author?.date?.split('T')[0];
				const committerDateStr = item.commit.committer?.date?.split('T')[0];
				const keyDate = committerDateStr || authorDateStr;
				if (!keyDate) return map;
				const current = map.get(keyDate);
				const count = (current?.count ?? 0) + 1;
				return map.set(keyDate, {
					date: new Date(keyDate),
					count,
					color: '',
					level: 'NONE' as const
				});
			}, new Map<string, { date: Date; count: number; color: string; level: 'NONE' }>())
			.values()
	) as Contribution[];

	const maxCount = Math.max(...contributions.map((el) => el.count).filter((c) => c > 0));

	return contributions.map((c: Contribution) => {
		const level = calculateContributionLevel(c.count, maxCount);
		const theme = getCurrentTheme(store);
		return {
			date: new Date(c.date),
			count: c.count,
			color: theme.intensityColors[levelToIndex(level)],
			level
		};
	});
};

const fetchGithubContributionsGraphQL = async (store: BaseStore): Promise<Contribution[]> => {
	const query = /* GraphQL */ `
		query ($login: String!) {
			user(login: $login) {
				contributionsCollection {
					contributionCalendar {
						weeks {
							contributionDays {
								date
								contributionCount
								color
								contributionLevel
							}
						}
					}
				}
			}
		}
	`;

	const token = store.config.githubSettings?.accessToken ?? '';
	const response = await githubFetch('https://api.github.com/graphql', token, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query, variables: { login: store.config.username } })
	});

	if (!response.ok) {
		throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
	}

	const json = (await response.json()) as GraphQLResponse;

	return json.data.user.contributionsCollection.contributionCalendar.weeks
		.map((week) => week.contributionDays)
		.reduce((acc, days) => acc.concat(days), [])
		.map((d) => {
			const level = d.contributionLevel;
			const theme = getCurrentTheme(store);
			return {
				date: new Date(d.date),
				count: d.contributionCount,
				color: theme.intensityColors[levelToIndex(level)],
				level
			};
		});
};
