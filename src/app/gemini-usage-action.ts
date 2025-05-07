"use server";
import { isUserPaid } from "@/app/profile/paid-status";
import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const TASTECHEQ_FREE_LIMIT = 5;

export async function getGeminiUsageCount() {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (!sessionId)
		return { count: 0, limit: TASTECHEQ_FREE_LIMIT, isPaid: false };
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) return { count: 0, limit: TASTECHEQ_FREE_LIMIT, isPaid: false };
	const isPaidUser = await isUserPaid(user.id);
	if (isPaidUser) {
		return { count: 0, limit: Number.POSITIVE_INFINITY, isPaid: true };
	}
	const now = new Date();
	const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	const usage = await db
		.selectFrom("GeminiUsage")
		.selectAll()
		.where("userId", "=", user.id)
		.where("month", "=", month)
		.executeTakeFirst();
	return {
		count: usage?.count ?? 0,
		limit: TASTECHEQ_FREE_LIMIT,
		isPaid: false,
	};
}
