import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "kysely";
import type { NextRequest } from "next/server";

// Helper to extract user from request (session cookie)
async function getUserFromRequest(req: NextRequest) {
	const cookie = req.cookies.get("session");
	if (!cookie) return null;
	return getUserFromSessionCookie(cookie.value);
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const restaurantId = searchParams.get("restaurantId");
	if (!restaurantId) {
		return new Response(JSON.stringify({ error: "Missing restaurantId" }), {
			status: 400,
		});
	}
	const items = await db
		.selectFrom("MenuItem")
		.selectAll()
		.where("restaurantId", "=", restaurantId)
		.where("deleted", "is", null)
		.orderBy("created", "desc")
		.execute();
	return new Response(JSON.stringify(items), { status: 200 });
}

export async function POST(req: NextRequest) {
	const user = await getUserFromRequest(req);
	if (!user) return new Response("Unauthorized", { status: 401 });
	const body = await req.json();
	const { restaurantId, name, price, description } = body;
	if (!restaurantId || !name) {
		return new Response(JSON.stringify({ error: "Missing fields" }), {
			status: 400,
		});
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
		return new Response(
			JSON.stringify({
				error: "A menu item with this name already exists for this restaurant.",
			}),
			{ status: 400 },
		);
	}
	const [item] = await db
		.insertInto("MenuItem")
		.values({
			id: crypto.randomUUID(),
			restaurantId,
			name,
			price: price ? price : null,
			description: description || "",
			createdById: user.id,
			created: new Date(),
		})
		.returningAll()
		.execute();
	return new Response(JSON.stringify(item), { status: 201 });
}

export async function PUT(req: NextRequest) {
	const user = await getUserFromRequest(req);
	if (!user) return new Response("Unauthorized", { status: 401 });
	const body = await req.json();
	const { id, name, price, description } = body;
	if (!id || !name) {
		return new Response(JSON.stringify({ error: "Missing fields" }), {
			status: 400,
		});
	}
	const [item] = await db
		.updateTable("MenuItem")
		.set({
			name,
			price: price ? price : null,
			description: description || "",
			updatedById: user.id,
			updated: new Date(),
		})
		.where("id", "=", id)
		.returningAll()
		.execute();
	return new Response(JSON.stringify(item), { status: 200 });
}

export async function DELETE(req: NextRequest) {
	const user = await getUserFromRequest(req);
	if (!user) return new Response("Unauthorized", { status: 401 });
	const { id } = await req.json();
	if (!id) {
		return new Response(JSON.stringify({ error: "Missing id" }), {
			status: 400,
		});
	}
	await db
		.updateTable("MenuItem")
		.set({ deleted: new Date(), deletedById: user.id })
		.where("id", "=", id)
		.execute();
	return new Response(null, { status: 204 });
}
