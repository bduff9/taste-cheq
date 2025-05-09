"use server";
import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function resetGeminiUsage(
	userId: string,
): Promise<{ success: boolean }> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	const admin = await getUserFromSessionCookie(sessionId);
	if (!admin || !admin.isAdmin) return { success: false };

	const now = new Date();
	const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

	const id = `${userId}-${month}`;
	const updated = new Date();

	// Upsert GeminiUsage for this user/month
	await db
		.insertInto("GeminiUsage")
		.values({ id, userId, month, count: 0, updated })
		.onConflict((oc) =>
			oc.columns(["userId", "month"]).doUpdateSet({ count: 0, updated }),
		)
		.execute();

	return { success: true };
}
