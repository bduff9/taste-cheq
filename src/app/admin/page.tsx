import ProfileNav from "@/app/profile/ProfileNav";
import { getUserFromSessionCookie } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminUserTable from "./AdminUserTable";
import { type AdminUserInfo, getAdminUsers } from "./get-admin-users";

export default async function AdminPage() {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	const user = await getUserFromSessionCookie(sessionId);
	if (!user || !user.isAdmin) {
		redirect("/auth");
	}

	const users: AdminUserInfo[] = await getAdminUsers();

	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
			<ProfileNav />
			<main className="flex-1 flex flex-col items-center justify-center px-4">
				<div className="max-w-3xl w-full bg-white rounded-lg shadow p-6 mt-8 mb-8 space-y-6">
					<h1 className="text-2xl font-bold mb-4">Admin: User Management</h1>
					<div className="overflow-x-auto">
						<AdminUserTable users={users} />
					</div>
				</div>
			</main>
			<footer className="w-full py-8 bg-blue-900 text-white text-center mt-16">
				<div className="max-w-4xl mx-auto flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 px-2 sm:px-4">
					<div className="flex items-center gap-2 min-w-0">
						<img
							src="/logo.svg"
							alt="TasteCheq Logo"
							width={28}
							height={28}
							className="rounded"
						/>
						<span className="font-bold text-base sm:text-lg truncate">
							TasteCheq
						</span>
					</div>
					<div className="flex gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap items-center">
						<a href="/about" className="hover:underline">
							About
						</a>
						<a href="/contact" className="hover:underline">
							Contact
						</a>
						<a href="/privacy" className="hover:underline">
							Privacy
						</a>
					</div>
					<div className="text-xs text-blue-200 min-w-0 truncate">
						&copy; {new Date().getFullYear()} TasteCheq. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
