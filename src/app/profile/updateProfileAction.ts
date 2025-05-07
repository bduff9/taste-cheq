"use server";
import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function updateProfileAction({
	name,
	homeCity,
	homeState,
	currentPassword,
	newPassword,
}: {
	name?: string;
	homeCity?: string;
	homeState?: string;
	currentPassword?: string;
	newPassword?: string;
}): Promise<{ success: boolean; error?: string }> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (!sessionId) return { success: false, error: "Not authenticated" };
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) return { success: false, error: "Not authenticated" };

	// If changing password, require current password
	if (newPassword) {
		if (!currentPassword) {
			return {
				success: false,
				error: "Current password required to change password",
			};
		}
		const valid = await bcrypt.compare(currentPassword, user.passwordHash);
		if (!valid) {
			return { success: false, error: "Current password is incorrect" };
		}
	}

	// Build update object
	const update: Partial<{
		name: string;
		homeCity: string | null;
		homeState: string | null;
		passwordHash: string;
	}> = {};
	if (name && name !== user.name) update.name = name;
	if (homeCity !== undefined && homeCity !== user.homeCity)
		update.homeCity = homeCity;
	if (homeState !== undefined && homeState !== user.homeState)
		update.homeState = homeState;
	if (newPassword) {
		if (newPassword.length < 6) {
			return {
				success: false,
				error: "New password must be at least 6 characters",
			};
		}
		update.passwordHash = await bcrypt.hash(newPassword, 12);
	}
	if (Object.keys(update).length === 0) {
		return { success: true };
	}
	await db.updateTable("User").set(update).where("id", "=", user.id).execute();
	return { success: true };
}
