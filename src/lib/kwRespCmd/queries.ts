import { db } from '$lib/db/index.js';
import { guilds, keywords, responses, type Keyword, type Response } from '$lib/db/schema.js';
import { and, eq } from 'drizzle-orm';

// Keyword queries
export async function findKeywords(guildId: string): Promise<Keyword[]> {
	return db.select().from(keywords).where(eq(keywords.guild, guildId));
}

export async function findKeyword(guildId: string, word: string): Promise<Keyword | undefined> {
	const result = await db
		.select()
		.from(keywords)
		.where(and(eq(keywords.guild, guildId), eq(keywords.word, word)))
		.limit(1);
	return result[0];
}

export const getKeywordIdQuery = (guildId: string, word: string) =>
	db
		.select({ id: keywords.id })
		.from(keywords)
		.where(and(eq(keywords.guild, guildId), eq(keywords.word, word)))
		.limit(1);

export async function getKeywordId(guildId: string, word: string): Promise<string | undefined> {
	const keyword = await getKeywordIdQuery(guildId, word);
	return keyword[0]!.id;
}

export async function keywordExists(guildId: string, word: string): Promise<boolean> {
	const keyword = await findKeyword(guildId, word);
	return keyword !== undefined;
}

export async function createKeyword(guildId: string, word: string): Promise<Keyword> {
	// Create Guild entry into DB if not exists
	await db.insert(guilds).values({ id: guildId }).onConflictDoNothing();

	const created = (await db.insert(keywords).values({ guild: guildId, word }).returning())[0];
	if (!created) throw new Error('Failed to create keyword!');

	return created;
}

export async function deleteKeyword(guildId: string, word: string): Promise<void> {
	await db.delete(keywords).where(and(eq(keywords.guild, guildId), eq(keywords.word, word)));
}

// Response queries
export async function findResponsesWithKeyword(
	guildId: string,
	keyword: string
): Promise<Response[]> {
	return db
		.select()
		.from(responses)
		.where(eq(responses.keyword, getKeywordIdQuery(guildId, keyword)));
}

export async function findResponses(keywordId: string): Promise<Response[]> {
	return db.select().from(responses).where(eq(responses.keyword, keywordId));
}

export async function findResponseWithKeyword(
	guildId: string,
	keyword: string,
	responseName: string
): Promise<Response | undefined> {
	const result = await db
		.select()
		.from(responses)
		.where(
			and(
				eq(responses.keyword, getKeywordIdQuery(guildId, keyword)),
				eq(responses.name, responseName)
			)
		)
		.limit(1);
	return result[0];
}

export async function findResponse(keywordId: string, name: string): Promise<Response | undefined> {
	const result = await db
		.select()
		.from(responses)
		.where(and(eq(responses.keyword, keywordId), eq(responses.name, name)))
		.limit(1);
	return result[0];
}

export async function responseExistsWithKeyword(
	guildId: string,
	keyword: string,
	responseName: string
): Promise<boolean> {
	const response = await findResponseWithKeyword(guildId, keyword, responseName);
	return response !== undefined;
}

export async function responseExists(keywordId: string, name: string): Promise<boolean> {
	const response = await findResponse(keywordId, name);
	return response !== undefined;
}

export async function createResponseWithKeyword(
	guildId: string,
	keyword: string,
	responseName: string,
	responseMessage: string
): Promise<Response> {
	const kwId = await getKeywordId(guildId, keyword);
	if (!kwId) throw new Error('Failed to get required keyword id!');

	const created = (
		await db
			.insert(responses)
			.values({
				keyword: kwId,
				name: responseName,
				message: responseMessage
			})
			.returning()
	)[0];

	if (!created) throw new Error('Failed to create response!');
	return created;
}

export async function createResponse(
	keywordId: string,
	name: string,
	message: string
): Promise<Response> {
	const created = (
		await db.insert(responses).values({ keyword: keywordId, name, message }).returning()
	)[0];
	if (!created) throw new Error('Failed to create response!');
	return created;
}

export async function deleteResponseWithKeyword(
	guildId: string,
	keyword: string,
	responseName: string
): Promise<void> {
	await db
		.delete(responses)
		.where(
			and(
				eq(responses.keyword, getKeywordIdQuery(guildId, keyword)),
				eq(responses.name, responseName)
			)
		);
}

export async function deleteResponse(keywordId: string, name: string): Promise<void> {
	await db.delete(responses).where(and(eq(responses.keyword, keywordId), eq(responses.name, name)));
}

// Autocomplete helpers
export async function getKeywordChoices(
	guildId: string,
	focused: string
): Promise<{ name: string; value: string }[]> {
	const all = await findKeywords(guildId);
	return all
		.filter((k) => k.word.startsWith(focused))
		.map((k) => ({ name: k.word, value: k.word }));
}

export async function getResponseChoices(
	guildId: string,
	keyword: string,
	focused: string
): Promise<{ name: string; value: string }[]> {
	const keywordRow = await findKeyword(guildId, keyword);
	if (!keywordRow) return [];
	const all = await findResponses(keywordRow.id);
	return all
		.filter((r) => r.name.startsWith(focused))
		.map((r) => ({ name: r.name, value: r.name }));
}
