import { defineConfig } from 'drizzle-kit';

if (!process.env['DB_NAME'])
	throw new Error('Database name not specified in environment variables!');

export default defineConfig({
	schema: './src/lib/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: { url: process.env['DB_NAME'] },
	verbose: true,
	strict: true
});
