"use server";
import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

// Fetch all ratings for the current user for all menu items in a restaurant
export async function getUserMenuItemRatings(restaurantId: string) {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (!sessionId) return [];
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) return [];
	// Get all menu item IDs for this restaurant
	const menuItems = await db
		.selectFrom("MenuItem")
		.select(["id"])
		.where("restaurantId", "=", restaurantId)
		.where("deleted", "is", null)
		.execute();
	const menuItemIds = menuItems.map((m) => m.id);
	if (!menuItemIds.length) return [];
	// Get all ratings for these menu items by this user
	const ratings = await db
		.selectFrom("Rating")
		.select(["menuItemId", "stars", "text"])
		.where("userId", "=", user.id)
		.where("menuItemId", "in", menuItemIds)
		.where("deleted", "is", null)
		.execute();
	return ratings;
}

// Fetch all tried items for the current user for all menu items in a restaurant
export async function getUserTriedItems(restaurantId: string) {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (!sessionId) return [];
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) return [];
	// Get all menu item IDs for this restaurant
	const menuItems = await db
		.selectFrom("MenuItem")
		.select(["id"])
		.where("restaurantId", "=", restaurantId)
		.where("deleted", "is", null)
		.execute();
	const menuItemIds = menuItems.map((m) => m.id);
	if (!menuItemIds.length) return [];
	// Get all tried items for these menu items by this user
	const triedItems = await db
		.selectFrom("TriedItem")
		.select(["menuItemId"])
		.where("userId", "=", user.id)
		.where("menuItemId", "in", menuItemIds)
		.where("deleted", "is", null)
		.execute();
	return triedItems;
}

// Upsert a rating for the current user and menu item
export async function upsertMenuItemRating({
	menuItemId,
	stars,
	text,
}: {
	menuItemId: string;
	stars: number;
	text?: string;
}): Promise<{ success: boolean; error?: string }> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (!sessionId) return { success: false, error: "Not authenticated" };
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) return { success: false, error: "Not authenticated" };
	if (!menuItemId || !stars) return { success: false, error: "Missing fields" };
	// Check if rating exists
	const existing = await db
		.selectFrom("Rating")
		.select(["id"])
		.where("userId", "=", user.id)
		.where("menuItemId", "=", menuItemId)
		.where("deleted", "is", null)
		.executeTakeFirst();
	if (existing) {
		// Update
		await db
			.updateTable("Rating")
			.set({
				stars,
				text: text ?? null,
				updatedById: user.id,
				updated: new Date(),
			})
			.where("id", "=", existing.id)
			.execute();
		return { success: true };
	}
	// Insert
	await db
		.insertInto("Rating")
		.values({
			id: randomUUID(),
			userId: user.id,
			menuItemId,
			stars,
			text: text ?? null,
			createdById: user.id,
			created: new Date(),
		})
		.execute();
	return { success: true };
}

// Set or unset tried status for a menu item for the current user
export async function setMenuItemTried({
	menuItemId,
	tried,
}: {
	menuItemId: string;
	tried: boolean;
}): Promise<{ success: boolean; error?: string }> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (!sessionId) return { success: false, error: "Not authenticated" };
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) return { success: false, error: "Not authenticated" };
	if (!menuItemId) return { success: false, error: "Missing menuItemId" };
	const existing = await db
		.selectFrom("TriedItem")
		.select(["id"])
		.where("userId", "=", user.id)
		.where("menuItemId", "=", menuItemId)
		.where("deleted", "is", null)
		.executeTakeFirst();
	if (tried) {
		if (!existing) {
			await db
				.insertInto("TriedItem")
				.values({
					id: randomUUID(),
					userId: user.id,
					menuItemId,
					createdById: user.id,
					created: new Date(),
				})
				.execute();
		}
		return { success: true };
	}
	if (existing) {
		await db
			.updateTable("TriedItem")
			.set({ deleted: new Date(), deletedById: user.id })
			.where("id", "=", existing.id)
			.execute();
	}
	revalidatePath("/scan");
	return { success: true };
}

// Fetch all menu items for a restaurant with average rating and review count
export async function getMenuItemsWithAggregates(restaurantId: string) {
	if (!restaurantId) return [];
	const items = await db
		.selectFrom("MenuItem")
		.select(["id", "name", "price", "description"])
		.where("restaurantId", "=", restaurantId)
		.where("deleted", "is", null)
		.orderBy("created", "desc")
		.execute();

	if (items.length === 0) return [];

	// For each item, get average rating and review count
	const aggregates = await db
		.selectFrom("Rating")
		.select(["menuItemId"])
		.select((eb) => [
			eb.fn.avg("stars").as("avgStars"),
			eb.fn.count("id").as("reviewCount"),
		])
		.where("deleted", "is", null)
		.where(
			"menuItemId",
			"in",
			items.map((i) => i.id),
		)
		.groupBy("menuItemId")
		.execute();
	const aggMap = Object.fromEntries(aggregates.map((a) => [a.menuItemId, a]));
	return items.map((item) => ({
		...item,
		avgStars: aggMap[item.id]?.avgStars
			? Number(aggMap[item.id].avgStars)
			: null,
		reviewCount: aggMap[item.id]?.reviewCount
			? Number(aggMap[item.id].reviewCount)
			: 0,
	}));
}

// Fetch all reviews for a menu item (with user info)
export async function getMenuItemReviews(menuItemId: string) {
	if (!menuItemId) return [];
	const rows = await db
		.selectFrom("Rating")
		.innerJoin("User", "User.id", "Rating.userId")
		.select([
			"Rating.stars as stars",
			"Rating.text as text",
			"Rating.created as created",
			"Rating.updated as updated",
			"User.id as userId",
			"User.name as userName",
			"User.avatarUrl as userAvatarUrl",
		])
		.where("Rating.menuItemId", "=", menuItemId)
		.where("Rating.deleted", "is", null)
		.orderBy("Rating.created", "desc")
		.execute();
	return rows.map((row) => ({
		user: {
			id: row.userId,
			name: row.userName,
			avatarUrl: row.userAvatarUrl ?? undefined,
		},
		stars: Number(row.stars),
		text: row.text ?? undefined,
		created: row.created,
		updated: row.updated ?? undefined,
	}));
}

// Fetch a single menu item by ID with average rating and review count
export async function getMenuItemWithAggregates(menuItemId: string) {
	if (!menuItemId) return null;
	const item = await db
		.selectFrom("MenuItem")
		.select(["id", "name", "price", "description", "restaurantId"])
		.where("id", "=", menuItemId)
		.where("deleted", "is", null)
		.executeTakeFirst();
	if (!item) return null;
	const aggregate = await db
		.selectFrom("Rating")
		.select((eb) => [
			eb.fn.avg("stars").as("avgStars"),
			eb.fn.count("id").as("reviewCount"),
		])
		.where("menuItemId", "=", menuItemId)
		.where("deleted", "is", null)
		.executeTakeFirst();
	return {
		...item,
		avgStars: aggregate?.avgStars ? Number(aggregate.avgStars) : null,
		reviewCount: aggregate?.reviewCount ? Number(aggregate.reviewCount) : 0,
	};
}
