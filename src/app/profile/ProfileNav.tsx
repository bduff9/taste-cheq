import { getUserFromSessionCookie } from "@/lib/auth";
import { cookies } from "next/headers";
import ProfileNavClient from "./ProfileNavClient";

export default async function ProfileNav() {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	const user = await getUserFromSessionCookie(sessionId);
	const clientUser = user
		? {
				id: user.id,
				name: user.name,
				email: user.email,
				isAdmin: !!user.isAdmin,
			}
		: null;
	return <ProfileNavClient user={clientUser} />;
}
