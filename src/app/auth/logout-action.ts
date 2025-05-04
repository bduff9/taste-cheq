"use server";
import { deleteSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function logout(): Promise<void> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (sessionId) {
		await deleteSession(sessionId);
		cookieStore.set("session", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			expires: new Date(0),
			path: "/",
		});
	}
}
