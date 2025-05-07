"use server";
import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import type { MenuItem } from "@/lib/db-types";
import { sql } from "kysely";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export async function addMenuItemAction({
	restaurantId,
	name,
	price,
	description,
}: {
	restaurantId: string;
	name: string;
	price?: string | null;
	description?: string | null;
}): Promise<{ success: boolean; item?: MenuItem; error?: string }> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (!sessionId) return { success: false, error: "Not authenticated" };
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) return { success: false, error: "Not authenticated" };
	if (!restaurantId || !name) {
		return { success: false, error: "Missing fields" };
	}
	// Check for duplicate name (case-insensitive, not deleted)
	const existing = await db
		.selectFrom("MenuItem")
		.select(["id"])
		.where("restaurantId", "=", restaurantId)
		.where(sql`lower(name)`, "=", name.toLowerCase())
		.where("deleted", "is", null)
		.executeTakeFirst();
	if (existing) {
		return {
			success: false,
			error: "A menu item with this name already exists for this restaurant.",
		};
	}
	const [item] = await db
		.insertInto("MenuItem")
		.values({
			id: randomUUID(),
			restaurantId,
			name,
			price: price ?? null,
			description: description ?? "",
			createdById: user.id,
			created: new Date(),
		})
		.returningAll()
		.execute();
	return { success: true, item: item as unknown as MenuItem };
}
