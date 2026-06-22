import { AnimationData } from '../../shared/types';
import { SVG } from '../core/constants';

export type FrameValueChange = {
	frameIndex: number;
	value: string;
};

export const buildChangingValuesAnimation = (values: string[]): AnimationData | null => {
	const totalFrames = values.length;
	if (totalFrames <= 1) return null;

	const keyTimes: number[] = [];
	const keyValues: string[] = [];
	let lastValue: string | null = null;

	values.forEach((currentValue, index) => {
		if (currentValue === lastValue) return;

		appendKeyframe(keyTimes, keyValues, frameToKeyTime(index, totalFrames), currentValue);
		lastValue = currentValue;
	});

	if (keyTimes.length === 0) return null;

	appendFinalKeyframe(keyTimes, keyValues);

	if (keyValues.length <= 1 || keyValues.every((value) => value === keyValues[0])) return null;

	return {
		keyTimes: keyTimes.join(';'),
		values: keyValues.join(';')
	};
};

export const buildFrameValueAnimation = (
	totalFrames: number,
	initialValue: string,
	changes: readonly FrameValueChange[]
): AnimationData | null => {
	if (totalFrames <= 1 || changes.length === 0) return null;

	const keyTimes: number[] = [0];
	const values: string[] = [initialValue];

	for (const change of changes) {
		appendKeyframe(keyTimes, values, frameToKeyTime(change.frameIndex, totalFrames), change.value);
	}

	appendFinalKeyframe(keyTimes, values);

	if (values.length <= 1 || values.every((value) => value === values[0])) return null;

	return {
		keyTimes: keyTimes.join(';'),
		values: values.join(';')
	};
};

export const buildValueWindowAnimation = (
	totalFrames: number,
	startFrame: number,
	endFrameExclusive: number,
	activeValue: string,
	inactiveValue = '0',
	omitFullWindow = false
): AnimationData | null => {
	if (totalFrames <= 1 || (omitFullWindow && startFrame === 0 && endFrameExclusive >= totalFrames)) return null;

	const start = frameToKeyTime(startFrame, totalFrames);
	const end = frameToKeyTime(endFrameExclusive, totalFrames);
	if (start >= end) return null;

	const keyTimes = start === 0 ? [0] : [0, start];
	const values = start === 0 ? [activeValue] : [inactiveValue, activeValue];

	if (end < 1) {
		keyTimes.push(end, 1);
		values.push(inactiveValue, inactiveValue);
	} else {
		keyTimes.push(1);
		values.push(activeValue);
	}

	if (values.length <= 1 || values.every((value) => value === values[0])) return null;

	return {
		keyTimes: keyTimes.join(';'),
		values: values.join(';')
	};
};

export const buildVisibilityAnimation = (totalFrames: number, startFrame: number, endFrameExclusive: number): AnimationData | null =>
	buildValueWindowAnimation(totalFrames, startFrame, endFrameExclusive, '1', '0', true);

export const buildStepwiseLinearAnimation = (values: string[]): AnimationData | null => {
	const totalFrames = values.length;
	if (totalFrames <= 1) return null;

	const keyTimes: number[] = [];
	const keyValues: string[] = [];
	let lastValue: string | null = null;
	let lastChangeIndex: number | null = null;

	values.forEach((currentValue, index) => {
		if (currentValue === lastValue) return;

		if (lastValue !== null && lastChangeIndex !== null && index - 1 !== lastChangeIndex) {
			appendKeyframe(keyTimes, keyValues, frameToKeyTime(index - 1, totalFrames), lastValue);
		}

		appendKeyframe(keyTimes, keyValues, frameToKeyTime(index, totalFrames), currentValue);
		lastValue = currentValue;
		lastChangeIndex = index;
	});

	appendFinalKeyframe(keyTimes, keyValues);

	if (keyValues.length <= 1 || keyValues.every((value) => value === keyValues[0])) return null;

	return {
		keyTimes: keyTimes.join(';'),
		values: keyValues.join(';')
	};
};

export const appendKeyframe = (keyTimes: number[], values: string[], time: number, value: string) => {
	if (time === keyTimes[keyTimes.length - 1]) {
		values[values.length - 1] = value;
		return;
	}

	keyTimes.push(time);
	values.push(value);
};

export const appendFinalKeyframe = (keyTimes: number[], values: string[]) => {
	if (keyTimes[keyTimes.length - 1] !== 1) {
		keyTimes.push(1);
		values.push(values[values.length - 1]);
	}
};

export const frameToKeyTime = (frameIndex: number, totalFrames: number) =>
	Number((Math.min(frameIndex, Math.max(totalFrames - 1, 1)) / Math.max(totalFrames - 1, 1)).toFixed(SVG.PRECISION));
