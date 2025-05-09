"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import type { AdminUserInfo } from "./get-admin-users";
import { resetGeminiUsage } from "./reset-gemini-usage";

export default function AdminUserTable({ users }: { users: AdminUserInfo[] }) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [resettingId, setResettingId] = React.useState<string | null>(null);

	const handleReset = async (userId: string) => {
		setResettingId(userId);
		await resetGeminiUsage(userId);
		setResettingId(null);
		startTransition(() => {
			router.refresh();
		});
	};

	return (
		<table className="min-w-full border text-sm">
			<thead>
				<tr className="bg-gray-100">
					<th className="p-2 border">Name</th>
					<th className="p-2 border">Email</th>
					<th className="p-2 border">Status</th>
					<th className="p-2 border">Gemini Usage</th>
					<th className="p-2 border">Actions</th>
				</tr>
			</thead>
			<tbody>
				{users.length === 0 ? (
					<tr>
						<td className="p-2 border" colSpan={5}>
							No users found.
						</td>
					</tr>
				) : (
					users.map((u) => (
						<tr key={u.id}>
							<td className="p-2 border font-medium">
								{u.name}{" "}
								{u.isAdmin && (
									<span className="text-xs text-blue-600">(admin)</span>
								)}
							</td>
							<td className="p-2 border">{u.email}</td>
							<td className="p-2 border">
								{u.subscriptionType === "free" ? (
									<span className="text-yellow-600">Free</span>
								) : (
									<span className="text-green-600 font-semibold">
										{u.subscriptionType.charAt(0).toUpperCase() +
											u.subscriptionType.slice(1)}
									</span>
								)}
							</td>
							<td className="p-2 border">{u.geminiUsage}</td>
							<td className="p-2 border">
								<Button
									size="sm"
									variant="secondary"
									disabled={pending && resettingId === u.id}
									onClick={() => handleReset(u.id)}
								>
									{pending && resettingId === u.id
										? "Resetting..."
										: "Reset Gemini"}
								</Button>
							</td>
						</tr>
					))
				)}
			</tbody>
		</table>
	);
}
