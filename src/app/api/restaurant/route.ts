import { db } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");
	if (!id) {
		return new Response(JSON.stringify({ error: "Missing id" }), {
			status: 400,
		});
	}
	const r = await db
		.selectFrom("Restaurant")
		.selectAll()
		.where("id", "=", id)
		.where("deleted", "is", null)
		.executeTakeFirst();
	if (!r) {
		return new Response(JSON.stringify({ error: "Not found" }), {
			status: 404,
		});
	}
	return new Response(
		JSON.stringify({
			id: r.id,
			name: r.name,
			address: r.address,
			location: { lat: r.latitude, lng: r.longitude },
			googlePlaceId: r.googlePlaceId,
		}),
		{ status: 200 },
	);
}
