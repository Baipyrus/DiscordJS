import { randomUUID } from 'crypto';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { keywords } from '$models/keywords.js';
import type { InferSelectModel } from 'drizzle-orm';

export const responses = sqliteTable('respones', {
	id: text().primaryKey().$defaultFn(randomUUID).notNull(),
	keyword: text()
		.references(() => keywords.id)
		.notNull(),
	name: text().notNull(),
	message: text().notNull()
});

export type Response = InferSelectModel<typeof responses>;
