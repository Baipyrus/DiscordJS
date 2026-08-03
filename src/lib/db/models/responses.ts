import { randomUUID } from 'crypto';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { keywords } from 'models/keywords.js';

export const responses = sqliteTable('respones', {
	id: text().primaryKey().$defaultFn(randomUUID).notNull(),
	keyword: text()
		.references(() => keywords.id)
		.notNull(),
	name: text().notNull(),
	response: text().notNull()
});
