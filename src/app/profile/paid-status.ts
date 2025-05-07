import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function getPaidStatus(): Promise<boolean> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (!sessionId) return false;
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) return false;
	const sub = await db
		.selectFrom("Subscription")
		.selectAll()
		.where("userId", "=", user.id)
		.where("status", "=", "active")
		.executeTakeFirst();
	return !!sub;
}

export async function isUserPaid(userId: string): Promise<boolean> {
	// Check if user is admin
	const user = await db
		.selectFrom("User")
		.select(["id", "isAdmin"])
		.where("id", "=", userId)
		.executeTakeFirst();
	if (user?.isAdmin) return true;

	const sub = await db
		.selectFrom("Subscription")
		.selectAll()
		.where("userId", "=", userId)
		.where("status", "=", "active")
		.executeTakeFirst();
	return !!sub;
}
