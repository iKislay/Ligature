import type { Contribution, ContributionLevel } from '../types';
import { SCENARIOS, type Scenario } from '../types';

export const SCENARIO_WEEKS = 53;
export const SCENARIO_DAYS = 7;

interface ScenarioResult {
	name: Scenario;
	contributions: Contribution[];
}

export const isScenarioName = (value: string): value is Scenario => SCENARIOS.includes(value as Scenario);

export const resolveScenarioName = (scenarioArg: string | undefined): Scenario => {
	const scenarioName = scenarioArg === '' || scenarioArg === undefined ? SCENARIOS[0] : scenarioArg;

	if (!isScenarioName(scenarioName)) {
		throw new Error(`Unknown scenario "${scenarioName}". Available scenarios: ${SCENARIOS.join(', ')}`);
	}

	return scenarioName;
};

export const generateScenarioContributions = (scenarioArg?: string): ScenarioResult => {
	const name = resolveScenarioName(scenarioArg);

	return {
		name,
		contributions: countsToContributions(createScenarioCounts(name))
	};
};

const createScenarioCounts = (name: Scenario): number[][] => {
	switch (name) {
		case 'empty':
			return createEmptyCounts();
		case 'full':
			return createFullCounts(8);
		case 'checkerboard':
			return createCheckerboardCounts({ low: 0, high: 10 });
		case 'gradient':
			return createGradientCounts({ min: 0, max: 12 });
		case 'streaks':
			return createStreakCounts();
		case 'random':
		default:
			return createRandomCounts({ density: 0.5, min: 1, max: 8 });
	}
};

const createEmptyCounts = () => Array.from({ length: SCENARIO_WEEKS }, () => Array(SCENARIO_DAYS).fill(0));

const createFullCounts = (count: number) =>
	Array.from({ length: SCENARIO_WEEKS }, () => Array(SCENARIO_DAYS).fill(toNonNegativeInteger(count)));

const createRandomCounts = ({ density, min, max }: { density: number; min: number; max: number }) => {
	const clampedDensity = clampNumber(density, 0, 1);
	const minimum = toNonNegativeInteger(min);
	const maximum = Math.max(minimum, toNonNegativeInteger(max));
	const contributionRange = maximum - minimum + 1;

	return Array.from({ length: SCENARIO_WEEKS }, (_, week) =>
		Array.from({ length: SCENARIO_DAYS }, (_, day) => {
			const value = Math.random();
			if (value >= clampedDensity) return 0;
			return minimum + Math.floor(Math.random() * contributionRange);
		})
	);
};

const createCheckerboardCounts = ({ low, high }: { low: number; high: number }) => {
	const lowCount = toNonNegativeInteger(low);
	const highCount = toNonNegativeInteger(high);

	return Array.from({ length: SCENARIO_WEEKS }, (_, week) =>
		Array.from({ length: SCENARIO_DAYS }, (_, day) => ((week + day) % 2 === 0 ? highCount : lowCount))
	);
};

const createGradientCounts = ({ min, max }: { min: number; max: number }) => {
	const minimum = toNonNegativeInteger(min);
	const maximum = Math.max(minimum, toNonNegativeInteger(max));

	return Array.from({ length: SCENARIO_WEEKS }, (_, week) =>
		Array.from({ length: SCENARIO_DAYS }, (_, day) => {
			const weekRatio = week / (SCENARIO_WEEKS - 1);
			const dayRatio = day / (SCENARIO_DAYS - 1);
			return Math.round(minimum + (maximum - minimum) * (weekRatio * 0.75 + dayRatio * 0.25));
		})
	);
};

const createStreakCounts = () => {
	const counts = createEmptyCounts();

	addHorizontalStreak(counts, { day: 1, startWeek: 2, length: 10, count: 6 });
	addHorizontalStreak(counts, { day: 3, startWeek: 18, length: 12, count: 10 });
	addHorizontalStreak(counts, { day: 5, startWeek: 38, length: 10, count: 14 });
	addHorizontalStreak(counts, { day: 0, startWeek: 43, length: 6, count: 4 });
	addHorizontalStreak(counts, { day: 6, startWeek: 43, length: 6, count: 4 });

	addVerticalBlock(counts, { startWeek: 8, length: 2, startDay: 1, endDay: 5, count: 8 });
	addVerticalBlock(counts, { startWeek: 27, length: 1, startDay: 0, endDay: 6, count: 12 });
	addVerticalBlock(counts, { startWeek: 49, length: 1, startDay: 2, endDay: 6, count: 16 });

	addDiagonalStreak(counts, { startWeek: 5, startDay: 0, length: 9, count: 7 });
	addDiagonalStreak(counts, { startWeek: 30, startDay: 6, length: 8, count: 11, direction: -1 });

	return counts;
};

const addHorizontalStreak = (
	counts: number[][],
	{ day, startWeek, length, count }: { day: number; startWeek: number; length: number; count: number }
) => {
	const normalizedDay = clampNumber(toNonNegativeInteger(day), 0, SCENARIO_DAYS - 1);
	const normalizedStartWeek = clampNumber(toNonNegativeInteger(startWeek), 0, SCENARIO_WEEKS - 1);
	const normalizedLength = toNonNegativeInteger(length);
	const normalizedCount = toNonNegativeInteger(count);

	for (let week = normalizedStartWeek; week < Math.min(SCENARIO_WEEKS, normalizedStartWeek + normalizedLength); week++) {
		counts[week][normalizedDay] = Math.max(counts[week][normalizedDay], normalizedCount);
	}
};

const addVerticalBlock = (
	counts: number[][],
	{ startWeek, length, startDay, endDay, count }: { startWeek: number; length: number; startDay: number; endDay: number; count: number }
) => {
	const normalizedStartWeek = clampNumber(toNonNegativeInteger(startWeek), 0, SCENARIO_WEEKS - 1);
	const normalizedLength = toNonNegativeInteger(length);
	const normalizedStartDay = clampNumber(toNonNegativeInteger(startDay), 0, SCENARIO_DAYS - 1);
	const normalizedEndDay = clampNumber(toNonNegativeInteger(endDay), normalizedStartDay, SCENARIO_DAYS - 1);
	const normalizedCount = toNonNegativeInteger(count);

	for (let week = normalizedStartWeek; week < Math.min(SCENARIO_WEEKS, normalizedStartWeek + normalizedLength); week++) {
		for (let day = normalizedStartDay; day <= normalizedEndDay; day++) {
			counts[week][day] = Math.max(counts[week][day], normalizedCount);
		}
	}
};

const addDiagonalStreak = (
	counts: number[][],
	{
		startWeek,
		startDay,
		length,
		count,
		direction = 1
	}: { startWeek: number; startDay: number; length: number; count: number; direction?: 1 | -1 }
) => {
	const normalizedStartWeek = clampNumber(toNonNegativeInteger(startWeek), 0, SCENARIO_WEEKS - 1);
	const normalizedStartDay = clampNumber(toNonNegativeInteger(startDay), 0, SCENARIO_DAYS - 1);
	const normalizedLength = toNonNegativeInteger(length);
	const normalizedCount = toNonNegativeInteger(count);

	for (let offset = 0; offset < normalizedLength; offset++) {
		const week = normalizedStartWeek + offset;
		const day = normalizedStartDay + offset * direction;

		if (week >= SCENARIO_WEEKS || day < 0 || day >= SCENARIO_DAYS) {
			continue;
		}

		counts[week][day] = Math.max(counts[week][day], normalizedCount);
	}
};

const countsToContributions = (counts: number[][]): Contribution[] => {
	const endDate = truncateToUTCDate(new Date());
	endDate.setUTCDate(endDate.getUTCDate() + (SCENARIO_DAYS - 1 - endDate.getUTCDay()));

	const startDate = new Date(endDate);
	startDate.setUTCDate(endDate.getUTCDate() - 365);
	startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());

	const maxCount = Math.max(0, ...counts.flat());
	const contributions: Contribution[] = [];

	for (let week = 0; week < SCENARIO_WEEKS; week++) {
		for (let day = 0; day < SCENARIO_DAYS; day++) {
			const date = new Date(startDate);
			date.setUTCDate(startDate.getUTCDate() + week * SCENARIO_DAYS + day);

			const count = counts[week][day];
			contributions.push({
				date,
				count,
				color: '',
				level: countToLevel(count, maxCount)
			});
		}
	}

	return contributions;
};

const countToLevel = (count: number, maxCount: number): ContributionLevel => {
	if (count === 0 || maxCount === 0) return 'NONE';

	const quartile = maxCount / 4;
	if (count < quartile) return 'FIRST_QUARTILE';
	if (count < quartile * 2) return 'SECOND_QUARTILE';
	if (count < quartile * 3) return 'THIRD_QUARTILE';
	return 'FOURTH_QUARTILE';
};

const truncateToUTCDate = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const toNonNegativeInteger = (value: number) => {
	if (!Number.isFinite(value) || value < 0) {
		throw new Error(`Scenario counts must be non-negative numbers. Received: ${value}`);
	}
	return Math.floor(value);
};

const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
