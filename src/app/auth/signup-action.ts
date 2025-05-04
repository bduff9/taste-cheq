"use server";
import { createSession, createUser, getUserByEmail } from "@/lib/auth";
import { cookies } from "next/headers";

export type SignupInput = {
	email: string;
	password: string;
	name: string;
	city?: string;
	state?: string;
};
export type SignupResult = { success: boolean; error?: string };

export async function signup(input: SignupInput): Promise<SignupResult> {
	// Basic validation
	if (!input.email || !input.password || !input.name) {
		return { success: false, error: "All fields are required." };
	}
	// Check for existing user
	const existing = await getUserByEmail(input.email);
	if (existing) {
		return { success: false, error: "Email already in use." };
	}
	try {
		const userId = await createUser({
			email: input.email,
			password: input.password,
			name: input.name,
			homeCity: input.city ?? null,
			homeState: input.state ?? null,
		});
		const { id: sessionId, expiresAt } = await createSession(userId);
		const cookieStore = await cookies();
		cookieStore.set("session", sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			expires: expiresAt,
			path: "/",
		});
		return { success: true };
	} catch (e) {
		return { success: false, error: "Signup failed. Please try again." };
	}
}
