"use client";
import { useUser } from "@/components/UserProvider";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateProfileAction } from "./updateProfileAction";

interface ProfileFormValues {
	name: string;
	homeCity: string;
	homeState: string;
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export default function ProfileForm() {
	const { user } = useUser();
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const form = useForm<ProfileFormValues>({
		defaultValues: {
			name: user?.name || "",
			homeCity: user?.homeCity || "",
			homeState: user?.homeState || "",
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	useEffect(() => {
		form.reset({
			name: user?.name || "",
			homeCity: user?.homeCity || "",
			homeState: user?.homeState || "",
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
	}, [user, form.reset]);

	const onSubmit = async (values: ProfileFormValues) => {
		setStatus(null);
		setError(null);
		const {
			name,
			homeCity,
			homeState,
			currentPassword,
			newPassword,
			confirmPassword,
		} = values;
		if (newPassword && newPassword !== confirmPassword) {
			form.setError("confirmPassword", {
				type: "validate",
				message: "Passwords do not match",
			});
			return;
		}
		const res = await updateProfileAction({
			name,
			homeCity,
			homeState,
			currentPassword: currentPassword || undefined,
			newPassword: newPassword || undefined,
		});
		if (res.success) {
			setStatus("Profile updated successfully.");
			form.reset({
				...values,
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} else {
			setError(res.error || "Update failed");
		}
	};

	return (
		<div className="mt-8">
			<h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="homeCity"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Home City</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="homeState"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Home State</FormLabel>
								<FormControl>
									<Input maxLength={2} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="border-t pt-4 mt-4">
						<h3 className="font-medium mb-2">Change Password</h3>
						<FormField
							control={form.control}
							name="currentPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Current Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showCurrent ? "text" : "password"}
												autoComplete="current-password"
												{...field}
											/>
											<button
												type="button"
												className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
												tabIndex={-1}
												onClick={() => setShowCurrent((v) => !v)}
												aria-label={
													showCurrent ? "Hide password" : "Show password"
												}
											>
												{showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="newPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showNew ? "text" : "password"}
												autoComplete="new-password"
												{...field}
											/>
											<button
												type="button"
												className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
												tabIndex={-1}
												onClick={() => setShowNew((v) => !v)}
												aria-label={showNew ? "Hide password" : "Show password"}
											>
												{showNew ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm New Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showConfirm ? "text" : "password"}
												autoComplete="new-password"
												{...field}
											/>
											<button
												type="button"
												className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
												tabIndex={-1}
												onClick={() => setShowConfirm((v) => !v)}
												aria-label={
													showConfirm ? "Hide password" : "Show password"
												}
											>
												{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button type="submit" className="w-full">
						Save Changes
					</Button>
					{status && (
						<div className="text-green-600 text-sm mt-2">{status}</div>
					)}
					{error && <div className="text-red-600 text-sm mt-2">{error}</div>}
				</form>
			</Form>
		</div>
	);
}
