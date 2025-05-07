"use server";
import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "kysely";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export async function addRestaurantAction({
	name,
	address,
	location,
	googlePlaceId,
}: {
	name: string;
	address: string;
	location?: { lat: number; lng: number };
	googlePlaceId?: string;
}): Promise<{
	id: string;
	name: string;
	address: string;
	location: { lat: number; lng: number };
	googlePlaceId?: string;
}> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	const user = sessionId ? await getUserFromSessionCookie(sessionId) : null;
	if (!name || !address || !location)
		throw new Error("Missing required fields");
	const existing = await db
		.selectFrom("Restaurant")
		.selectAll()
		.where(sql`lower(name)`, "=", name.toLowerCase())
		.where(sql`lower(address)`, "=", address.toLowerCase())
		.where("deleted", "is", null)
		.executeTakeFirst();
	if (existing) {
		return {
			id: existing.id,
			name: existing.name,
			address: existing.address,
			location: { lat: existing.latitude, lng: existing.longitude },
			googlePlaceId: existing.googlePlaceId,
		};
	}
	const [restaurant] = await db
		.insertInto("Restaurant")
		.values({
			id: randomUUID(),
			name,
			address,
			latitude: location.lat,
			longitude: location.lng,
			googlePlaceId: googlePlaceId ?? "",
			createdById: user?.id ?? null,
			created: new Date(),
		})
		.returningAll()
		.execute();
	return {
		id: restaurant.id,
		name: restaurant.name,
		address: restaurant.address,
		location: { lat: restaurant.latitude, lng: restaurant.longitude },
		googlePlaceId: restaurant.googlePlaceId,
	};
}
