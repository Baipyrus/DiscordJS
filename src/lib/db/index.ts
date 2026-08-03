import { drizzle } from 'drizzle-orm/libsql';

if (!process.env['DB_NAME'])
	throw new Error('Database name not specified in environment variables!');

export const db = drizzle(process.env['DB_NAME']);
