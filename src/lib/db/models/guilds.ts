import { text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const guilds = sqliteTable('guilds', {
	id: text().primaryKey()
});
