"use server";
import { createSession, verifyUserPassword } from "@/lib/auth";
import { cookies } from "next/headers";

export type LoginInput = { email: string; password: string };
export type LoginResult = { success: boolean; error?: string };

export async function login(input: LoginInput): Promise<LoginResult> {
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
