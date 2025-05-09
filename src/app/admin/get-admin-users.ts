"use server";
import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export type AdminUserInfo = {
	id: string;
	name: string;
	email: string;
	isAdmin: boolean;
	subscriptionType: string;
	subscriptionStatus: string;
	geminiUsage: number;
};

export async function getAdminUsers(): Promise<AdminUserInfo[]> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	const user = await getUserFromSessionCookie(sessionId);
	if (!user || !user.isAdmin) return [];

	// Get current month string (YYYY-MM)
	const now = new Date();
	const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

	// Fetch all users
	const users = await db.selectFrom("User").selectAll().execute();

	// Fetch all subscriptions
	const subs = await db.selectFrom("Subscription").selectAll().execute();

	// Fetch all Gemini usage for this month
	const usages = await db
		.selectFrom("GeminiUsage")
		.selectAll()
		.where("month", "=", month)
		.execute();

	return users.map((u) => {
		const sub = subs.find((s) => s.userId === u.id && s.status === "active");
		const usage = usages.find((gu) => gu.userId === u.id);
		return {
			id: u.id,
			name: u.name,
			email: u.email,
			isAdmin: !!u.isAdmin,
			subscriptionType: sub?.type || "free",
			subscriptionStatus: sub?.status || "none",
			geminiUsage: usage?.count ?? 0,
		};
	});
}
