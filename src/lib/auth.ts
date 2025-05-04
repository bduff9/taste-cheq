import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import type { Session, User } from "./db-types";

// --- User Management ---

export const createUser = async ({
	email,
	password,
	name,
	avatarUrl,
	homeCity,
	homeState,
}: {
	email: string;
	password: string;
	name: string;
	avatarUrl?: string | null;
	homeCity?: string | null;
	homeState?: string | null;
}) => {
	const passwordHash = await bcrypt.hash(password, 12);
	const id = randomUUID();
	await db
		.insertInto("User")
		.values({
			id,
			email,
			passwordHash,
			name,
			avatarUrl: avatarUrl ?? null,
			homeCity: homeCity ?? null,
			homeState: homeState ?? null,
			isAdmin: false,
			created: new Date(),
			createdById: null,
			updated: null,
			updatedById: null,
			deleted: null,
			deletedById: null,
		})
		.execute();
	return id;
};

export const getUserByEmail = async (
	email: string,
): Promise<User | undefined> => {
	return db
		.selectFrom("User")
		.selectAll()
		.where("email", "=", email)
		.executeTakeFirst() as Promise<User | undefined>;
};

export const verifyUserPassword = async (
	email: string,
	password: string,
): Promise<User | null> => {
	const user = await getUserByEmail(email);
	if (!user) return null;
	const valid = await bcrypt.compare(password, user.passwordHash);
	return valid ? user : null;
};

// --- Session Management ---

export const createSession = async (
	userId: string,
	expiresInMs = 1000 * 60 * 60 * 24 * 7,
) => {
	const id = randomUUID();
	const expiresAt = new Date(Date.now() + expiresInMs);
	await db
		.insertInto("Session")
		.values({
			id,
			userId,
			expiresAt,
			createdAt: new Date(),
		})
		.execute();
	return { id, expiresAt };
};

export const getUserFromSessionCookie = async (
	sessionId: string | undefined,
) => {
	if (!sessionId) return null;
	const session = (await db
		.selectFrom("Session")
		.selectAll()
		.where("id", "=", sessionId)
		.where("expiresAt", ">", new Date())
		.executeTakeFirst()) as Session | undefined;
	if (!session) return null;
	const user = (await db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", session.userId)
		.executeTakeFirst()) as User | undefined;
	return user || null;
};

export const deleteSession = async (sessionId: string) => {
	await db.deleteFrom("Session").where("id", "=", sessionId).execute();
};
