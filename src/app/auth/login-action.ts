"use server";
import { createSession, verifyUserPassword } from "@/lib/auth";
import { cookies } from "next/headers";

export async function login(input: {
	email: string;
	password: string;
}): Promise<{ success: boolean; error?: string }> {
	// Validate input (simple runtime check)
	if (!input.email || !input.password) {
		return { success: false, error: "Email and password are required." };
	}
	const user = await verifyUserPassword(input.email, input.password);
	if (!user) {
		return { success: false, error: "Invalid email or password." };
	}
	const { id: sessionId, expiresAt } = await createSession(user.id);
	const cookieStore = await cookies();
	cookieStore.set("session", sessionId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		expires: expiresAt,
		path: "/",
	});
	return { success: true };
}
