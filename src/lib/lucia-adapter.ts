import type { Adapter } from "lucia";
import { randomUUID } from "node:crypto";
import { db } from "./db";

export function KyselyAdapter(): Adapter {
	return {
		// Create a new user
		async createUser(data) {
			const id = data.id ?? randomUUID();
			await db
				.insertInto("User")
				.values({
					id,
					email: data.email,
					passwordHash: data.hashedPassword,
					name: data.attributes?.name ?? "",
					avatarUrl: data.attributes?.avatarUrl ?? null,
					homeCity: data.attributes?.homeCity ?? null,
					homeState: data.attributes?.homeState ?? null,
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
		},

		// Get a user by id
		async getUser(userId: string) {
			const user = await db
				.selectFrom("User")
				.selectAll()
				.where("id", "=", userId)
				.executeTakeFirst();
			if (!user) return null;
			return {
				id: user.id,
				attributes: {
					email: user.email,
					name: user.name,
					avatarUrl: user.avatarUrl,
					homeCity: user.homeCity,
					homeState: user.homeState,
					isAdmin: user.isAdmin,
				},
			};
		},

		// Get a user by email
		async getUserByEmail(email) {
			const user = await db
				.selectFrom("User")
				.selectAll()
				.where("email", "=", email)
				.executeTakeFirst();
			if (!user) return null;
			return {
				id: user.id,
				email: user.email,
				hashedPassword: user.passwordHash,
				attributes: {
					name: user.name,
					avatarUrl: user.avatarUrl,
					homeCity: user.homeCity,
					homeState: user.homeState,
					isAdmin: user.isAdmin,
				},
			} satisfies AdapterUser;
		},

		// Create a session
		async createSession(session) {
			await db
				.insertInto("Session")
				.values({
					id: session.id,
					userId: session.userId,
					expiresAt: session.expiresAt,
					createdAt: new Date(),
				})
				.execute();
		},

		// Get a session by id
		async getSession(sessionId: string) {
			const session = await db
				.selectFrom("Session")
				.selectAll()
				.where("id", "=", sessionId)
				.executeTakeFirst();
			if (!session) return null;
			return {
				id: session.id,
				userId: session.userId,
				expiresAt: session.expiresAt,
				attributes: {},
			};
		},

		// Delete a session by id
		async deleteSession(sessionId: string) {
			await db.deleteFrom("Session").where("id", "=", sessionId).execute();
		},

		// Delete all sessions for a user
		async deleteSessionsByUserId(userId: string) {
			await db.deleteFrom("Session").where("userId", "=", userId).execute();
		},

		// Set a user
		async setUser(user: { id: string; attributes: any }) {
			await db
				.insertInto("User")
				.values({
					id: user.id,
					email: user.attributes.email,
					name: user.attributes.name ?? "",
					avatarUrl: user.attributes.avatarUrl ?? null,
					homeCity: user.attributes.homeCity ?? null,
					homeState: user.attributes.homeState ?? null,
					isAdmin: user.attributes.isAdmin ?? false,
					passwordHash: user.attributes.passwordHash ?? "",
					created: new Date(),
					createdById: null,
					updated: null,
					updatedById: null,
					deleted: null,
					deletedById: null,
				})
				.execute();
		},

		// Delete a user
		async deleteUser(userId: string) {
			await db.deleteFrom("User").where("id", "=", userId).execute();
		},

		// Set a session
		async setSession(session: {
			id: string;
			userId: string;
			expiresAt: Date;
			attributes: any;
		}) {
			await db
				.insertInto("Session")
				.values({
					id: session.id,
					userId: session.userId,
					expiresAt: session.expiresAt,
					createdAt: new Date(),
				})
				.execute();
		},
	};
}
