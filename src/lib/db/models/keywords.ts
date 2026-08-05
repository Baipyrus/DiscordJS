import { randomUUID } from 'crypto';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { guilds } from '$models/guilds.js';
import type { InferSelectModel } from 'drizzle-orm';

export const keywords = sqliteTable('keywords', {
	id: text().primaryKey().$defaultFn(randomUUID).notNull(),
	guild: text()
		.references(() => guilds.id)
		.notNull(),
	word: text().notNull()
});

export type Keyword = InferSelectModel<typeof keywords>;
