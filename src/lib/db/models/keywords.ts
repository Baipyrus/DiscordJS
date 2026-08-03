import { randomUUID } from 'crypto';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { guilds } from 'models/guilds.js';

export const keywords = sqliteTable('keywords', {
	id: text().primaryKey().$defaultFn(randomUUID).notNull(),
	guild: text()
		.references(() => guilds.id)
		.notNull(),
	name: text().notNull()
});
