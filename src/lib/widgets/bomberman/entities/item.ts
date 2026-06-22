import { BombermanStore, ItemModel, ItemType, PlayerModel, Position } from '../types';
import {
	ITEM_DROP_CHANCE_BY_LEVEL,
	ITEM_DROP_MAX_SPARSE_MULTIPLIER,
	ITEM_DROP_TARGET_EXPECTED_COUNT,
	ITEM_SPRITES,
	SPEED_ITEM_BONUS
} from '../core/constants';
import { GameState } from '../core/state';
import { GridPosition } from '../core/board';

export interface PowerUp {
	applyTo(player: PlayerModel): void;
}

export class BlastRangePowerUp implements PowerUp {
	applyTo(player: PlayerModel) {
		player.increaseBlastRange();
	}
}

export class SpeedPowerUp implements PowerUp {
	applyTo(player: PlayerModel) {
		player.increaseSpeed(SPEED_ITEM_BONUS);
	}
}

export class BombCapacityPowerUp implements PowerUp {
	applyTo(player: PlayerModel) {
		player.increaseBombCapacity();
	}
}

export class BombKickPowerUp implements PowerUp {
	applyTo(player: PlayerModel) {
		player.enableBombKick();
	}
}

export type ItemDefinition = {
	sprite: {
		readonly width: number;
		readonly height: number;
		readonly data: string;
	};
	powerUp: PowerUp;
};

export const ITEM_DEFINITIONS: Record<ItemType, ItemDefinition> = {
	'blast-range': {
		sprite: ITEM_SPRITES.blastRange,
		powerUp: new BlastRangePowerUp()
	},
	speed: {
		sprite: ITEM_SPRITES.speed,
		powerUp: new SpeedPowerUp()
	},
	'bomb-capacity': {
		sprite: ITEM_SPRITES.bombCapacity,
		powerUp: new BombCapacityPowerUp()
	},
	'bomb-kick': {
		sprite: ITEM_SPRITES.bombKick,
		powerUp: new BombKickPowerUp()
	}
};

export const ITEM_TYPE_WEIGHTS: Record<ItemType, number> = {
	'blast-range': 3,
	speed: 3,
	'bomb-capacity': 3,
	'bomb-kick': 1
};

export class Item implements ItemModel {
	static createHiddenItems(store: BombermanStore) {
		store.items = [];
		const sparseMultiplier = Item.calculateSparseDropMultiplier(store);

		for (let x = 0; x < store.grid.length; x++) {
			for (let y = 0; y < store.grid[x].length; y++) {
				const cell = store.grid[x][y];
				const baseDropChance = cell.commitsCount > 0 ? ITEM_DROP_CHANCE_BY_LEVEL[cell.level] : 0;
				const dropChance = Math.min(1, baseDropChance * sparseMultiplier);
				if (dropChance <= 0 || Math.random() >= dropChance) continue;

				store.items.push(Item.create(store, { x, y }, Item.selectRandomType()));
			}
		}
	}

	static revealAt(store: BombermanStore, position: Position) {
		const item = Item.findAt(store, position);
		if (!item) return null;

		return item.reveal() ? item : null;
	}

	static collectVisibleAt(store: BombermanStore, player: PlayerModel) {
		const item = Item.findAt(store, player);
		if (!item?.visible) return null;

		return item.collectBy(player) ? item : null;
	}

	static destroyVisibleAt(store: BombermanStore, position: Position) {
		const item = Item.findAt(store, position);
		if (!item) return null;

		return item.destroy() ? item : null;
	}

	static hasVisibleAt(store: BombermanStore, position: Position) {
		return Boolean(Item.findAt(store, position)?.visible);
	}

	private static create(store: BombermanStore, position: Position, type: ItemType): ItemModel {
		return new Item(GameState.from(store).nextItemId(), type, position.x, position.y);
	}

	private static calculateSparseDropMultiplier(store: BombermanStore) {
		const expectedDropCount = store.grid.reduce(
			(total, column) =>
				total +
				column.reduce((columnTotal, cell) => columnTotal + (cell.commitsCount > 0 ? ITEM_DROP_CHANCE_BY_LEVEL[cell.level] : 0), 0),
			0
		);
		if (expectedDropCount <= 0 || expectedDropCount >= ITEM_DROP_TARGET_EXPECTED_COUNT) return 1;

		return Math.min(ITEM_DROP_MAX_SPARSE_MULTIPLIER, ITEM_DROP_TARGET_EXPECTED_COUNT / expectedDropCount);
	}

	private static selectRandomType(): ItemType {
		const itemTypes = Object.keys(ITEM_DEFINITIONS) as ItemType[];
		const totalWeight = itemTypes.reduce((sum, itemType) => sum + ITEM_TYPE_WEIGHTS[itemType], 0);
		let randomWeight = Math.random() * totalWeight;

		for (const itemType of itemTypes) {
			randomWeight -= ITEM_TYPE_WEIGHTS[itemType];
			if (randomWeight < 0) return itemType;
		}

		return 'blast-range';
	}

	private static findAt(store: BombermanStore, position: Position) {
		const target = GridPosition.from(position);
		if (!target.inBounds()) return undefined;
		return store.items.find((item) => !item.collected && !item.destroyed && target.equals(item));
	}

	constructor(
		public id: number,
		public type: ItemType,
		public x: number,
		public y: number,
		public hidden = true,
		public collected = false,
		public destroyed = false
	) {}

	get visible() {
		return !this.hidden && !this.collected && !this.destroyed;
	}

	reveal() {
		if (this.collected || this.destroyed) return false;
		this.hidden = false;
		return true;
	}

	collectBy(player: PlayerModel) {
		if (!this.visible) return false;

		ITEM_DEFINITIONS[this.type].powerUp.applyTo(player);
		return this.collect();
	}

	collect() {
		if (!this.visible) return false;
		this.collected = true;
		return true;
	}

	destroy() {
		if (!this.visible) return false;
		this.destroyed = true;
		return true;
	}
}
