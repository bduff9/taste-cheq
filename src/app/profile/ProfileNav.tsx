"use client";
import { logout } from "@/app/auth/logout-action";
import { useUser } from "@/components/UserProvider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ProfileNav() {
	const { user } = useUser();
	const [logoutLoading, setLogoutLoading] = useState(false);
	const handleLogout = async () => {
		setLogoutLoading(true);
		await logout();
		setLogoutLoading(false);
		window.location.href = "/";
	};
	return (
		<nav className="w-full bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
			<div className="flex items-center gap-2">
				<Image
					src="/logo.svg"
					alt="TasteCheq Logo"
					width={32}
					height={32}
					className="rounded"
				/>
				<Link href="/" className="text-xl font-bold text-blue-700">
					TasteCheq
				</Link>
			</div>
			<div className="flex gap-4 items-center">
				<Link href="/" className="hover:underline text-blue-700 font-medium">
					Home
				</Link>
				{user && (
					<Link
						href="/scan"
						className="hover:underline text-blue-700 font-medium"
					>
						Scan
					</Link>
				)}
				<Link
					href="/profile"
					className="hover:underline text-blue-700 font-medium"
				>
					Profile
				</Link>
				{user && (
					<Button
						variant="secondary"
						size="sm"
						onClick={handleLogout}
						disabled={logoutLoading}
					>
						{logoutLoading ? "Logging out..." : "Logout"}
					</Button>
				)}
			</div>
		</nav>
	);
}
