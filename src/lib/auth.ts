import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import type { Session, User } from "./db-types";

// --- User Management ---

export async function createUser({
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
}) {
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
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
	return db
		.selectFrom("User")
		.selectAll()
		.where("email", "=", email)
		.executeTakeFirst() as Promise<User | undefined>;
}

export async function getUserById(id: string): Promise<User | undefined> {
	return db
		.selectFrom("User")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst() as Promise<User | undefined>;
}

export async function verifyUserPassword(
	email: string,
	password: string,
): Promise<User | null> {
	const user = await getUserByEmail(email);
	if (!user) return null;
	const valid = await bcrypt.compare(password, user.passwordHash);
	return valid ? user : null;
}

// --- Session Management ---

export async function createSession(
	userId: string,
	expiresInMs = 1000 * 60 * 60 * 24 * 7,
) {
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
}

export async function getSession(
	sessionId: string,
): Promise<Session | undefined> {
	return db
		.selectFrom("Session")
		.selectAll()
		.where("id", "=", sessionId)
		.where("expiresAt", ">", new Date())
		.executeTakeFirst() as Promise<Session | undefined>;
}

export async function deleteSession(sessionId: string) {
	await db.deleteFrom("Session").where("id", "=", sessionId).execute();
}

export async function deleteUserSessions(userId: string) {
	await db.deleteFrom("Session").where("userId", "=", userId).execute();
}

export async function deleteExpiredSessions() {
	await db.deleteFrom("Session").where("expiresAt", "<=", new Date()).execute();
}

export async function updateSessionExpiration(
	sessionId: string,
	newExpiry: Date,
) {
	await db
		.updateTable("Session")
		.set({ expiresAt: newExpiry })
		.where("id", "=", sessionId)
		.execute();
}

export async function getUserFromSessionCookie(sessionId: string | undefined) {
	if (!sessionId) return null;
	const session = await getSession(sessionId);
	if (!session) return null;
	const user = await getUserById(session.userId);
	return user || null;
}
