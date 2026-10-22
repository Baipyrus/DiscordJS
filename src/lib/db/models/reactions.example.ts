/* eslint no-magic-numbers: off */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { guilds } from '$models/guilds.example.js';
import type { InferSelectModel } from 'drizzle-orm';
import { MessageReaction } from 'discord.js';
import { randomUUID } from 'crypto';
import { REACTION_COPYABLE_BOOL } from '$lib/constants.js';

export const reactions = sqliteTable('reactions', {
	id: text().primaryKey().$defaultFn(randomUUID).notNull(),
	guild: text()
		.references(() => guilds.id)
		.notNull(),
	emoji: text().notNull(),
	isCopyable: integer('is_copyable').default(REACTION_COPYABLE_BOOL).notNull()
});

export class Reaction implements InferSelectModel<typeof reactions> {
	id!: string;
	guild!: string;
	emoji!: string;
	isCopyable!: number;

	constructor(reaction: MessageReaction);
	constructor(guild: string, emoji: string);
	constructor(guild: string, emoji: string, isCopyable: number);
	constructor(...params: unknown[]) {
		switch (params.length) {
			case 1:
				this.initReaction(params[0] as MessageReaction);
				break;
			case 2:
			case 3:
				this.initBasic(...(params as [string, string, number?]));
				break;
			default:
				throw new Error('Unknown amount of parameters during constructor call!');
		}
	}

	private initBasic(guild: string, emoji: string, isCopyable = REACTION_COPYABLE_BOOL) {
		this.id = '';
		this.guild = guild;
		this.emoji = emoji;
		this.isCopyable = isCopyable;
	}

	private initReaction(reaction: MessageReaction) {
		const { id, guild, emoji } = Reaction.fromMessageReaction(reaction);

		this.id = id;
		this.guild = guild;
		this.emoji = emoji;
		this.isCopyable = REACTION_COPYABLE_BOOL;
	}

	static fromMessageReaction(reaction: MessageReaction): Reaction {
		return {
			id: '',
			guild: reaction.message.guildId!,
			emoji: reaction.emoji.toString(),
			isCopyable: REACTION_COPYABLE_BOOL
		} as Reaction;
	}
}
