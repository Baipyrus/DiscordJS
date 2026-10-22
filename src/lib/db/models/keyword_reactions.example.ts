import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { keywords } from '$models/keywords.example.js';
import { reactions } from '$models/reactions.example.js';
import type { InferSelectModel } from 'drizzle-orm';

export const keywordReactions = sqliteTable('keyword_reactions', {
	keyword: text()
		.references(() => keywords.id)
		.notNull(),
	reaction: text()
		.references(() => reactions.id)
		.notNull()
});

export type KeywordReaction = InferSelectModel<typeof keywordReactions>;
