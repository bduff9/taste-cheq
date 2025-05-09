"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type User = {
	id: string;
	name: string;
	email: string;
	isAdmin?: boolean;
};

export default function ProfileNavClient({ user }: { user: User | null }) {
	const [logoutLoading, setLogoutLoading] = useState(false);
	const handleLogout = async () => {
		setLogoutLoading(true);
		// Use fetch to call logout endpoint
		await fetch("/api/auth/logout", { method: "POST" });
		setLogoutLoading(false);
		window.location.href = "/";
	};
	return (
		<nav className="w-full bg-white border-b border-gray-200 py-3 px-2 sm:px-4 flex flex-wrap items-center justify-between gap-2 sm:gap-0">
			<div className="flex items-center gap-2 min-w-0">
				<Image
					src="/logo.svg"
					alt="TasteCheq Logo"
					width={28}
					height={28}
					className="rounded"
				/>
				<Link
					href="/"
					className="hidden sm:inline text-lg sm:text-xl font-bold text-blue-700 truncate"
				>
					TasteCheq
				</Link>
			</div>
			<div className="flex gap-3 sm:gap-4 items-center flex-wrap min-w-0">
				<Link
					href="/"
					className="hover:underline text-blue-700 font-medium text-sm sm:text-base"
				>
					Home
				</Link>
				{user && (
					<Link
						href="/scan"
						className="hover:underline text-blue-700 font-medium text-sm sm:text-base"
					>
						Scan
					</Link>
				)}
				{user && (
					<Link
						href="/profile"
						className="hover:underline text-blue-700 font-medium text-sm sm:text-base"
					>
						Profile
					</Link>
				)}
				{user?.isAdmin && (
					<Link
						href="/admin"
						className="hover:underline text-blue-700 font-medium text-sm sm:text-base"
					>
						Admin
					</Link>
				)}
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
