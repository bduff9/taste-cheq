import { isUserPaid } from "@/app/profile/paid-status";
import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

const TASTECHEQ_FREE_LIMIT = 5;

export async function POST(req: NextRequest) {
	// --- Auth: get user from session cookie ---
	const sessionId = req.cookies.get("session")?.value;
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	const { imageBase64 } = await req.json();
	// Read Gemini API key from environment variable
	// Set GEMINI_API_KEY in your .env file (never commit secrets)
	const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
	if (!GEMINI_API_KEY) {
		return new Response(
			JSON.stringify({ error: "GEMINI_API_KEY is not set in environment." }),
			{ status: 500 },
		);
	}

	// --- Usage tracking ---
	const paid = await isUserPaid(user.id);
	if (!paid) {
		const now = new Date();
		const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
		const usage = await db
			.selectFrom("GeminiUsage")
			.selectAll()
			.where("userId", "=", user.id)
			.where("month", "=", month)
			.executeTakeFirst();
		if ((usage?.count ?? 0) >= TASTECHEQ_FREE_LIMIT) {
			return new Response(
				JSON.stringify({ error: "Free tier TasteCheq AI usage limit reached" }),
				{ status: 429 },
			);
		}
		// --- Upsert usage ---
		if (usage) {
			await db
				.updateTable("GeminiUsage")
				.set({ count: usage.count + 1, updated: new Date() })
				.where("id", "=", usage.id)
				.execute();
		} else {
			await db
				.insertInto("GeminiUsage")
				.values({
					id: randomUUID(),
					userId: user.id,
					month,
					count: 1,
					created: new Date(),
					updated: new Date(),
				})
				.execute();
		}
	}

	// --- Call Gemini API ---
	const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
	const prompt = `Extract all menu items from this image. Return a JSON array of objects with name, price if available, and description fields. Example: [{"name": "Cheeseburger", "price": "$12", "description": "Beef patty, cheese, lettuce, tomato"}]`;

	const geminiReq = {
		contents: [
			{
				parts: [
					{ text: prompt },
					{
						inlineData: {
							mimeType: "image/png",
							data: imageBase64.replace(/^data:image\/(png|jpeg);base64,/, ""),
						},
					},
				],
			},
		],
	};

	const geminiRes = await fetch(geminiUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(geminiReq),
	});

	if (!geminiRes.ok) {
		return new Response(
			JSON.stringify({ error: "Gemini API error", status: geminiRes.status }),
			{ status: 500 },
		);
	}

	const geminiData = await geminiRes.json();
	// Try to extract the JSON array from the response
	let menuItems: Array<{ name: string; price?: string; description?: string }> =
		[];
	try {
		// Gemini returns candidates[0].content.parts[0].text
		const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
		// Find the first '[' and last ']' to extract the JSON array
		const firstBracket = text.indexOf("[");
		const lastBracket = text.lastIndexOf("]");
		if (
			firstBracket !== -1 &&
			lastBracket !== -1 &&
			lastBracket > firstBracket
		) {
			const jsonStr = text.slice(firstBracket, lastBracket + 1);
			menuItems = JSON.parse(jsonStr);
		} else {
			throw new Error("No JSON array found in Gemini response");
		}
	} catch (err) {
		return new Response(
			JSON.stringify({ error: "Failed to parse Gemini response" }),
			{ status: 500 },
		);
	}

	return new Response(JSON.stringify(menuItems), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
}
