"use client";
import { login } from "@/app/auth/login-action";
import { logout } from "@/app/auth/logout-action";
import { signup } from "@/app/auth/signup-action";
import { useUser } from "@/components/UserProvider";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { type } from "arktype";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

const loginSchema = type({
	email: "string.email",
	password: "string>6",
});

type LoginFormData = typeof loginSchema.infer;

const signupSchema = type({
	email: "string.email",
	password: "string>6",
	confirmPassword: "string>6",
	name: "string>2",
	city: "string>2",
	state: "string>2",
});

type SignupFormData = typeof signupSchema.infer;

const HomePage = () => {
	const { user } = useUser();
	const [showAuth, setShowAuth] = useState<"none" | "login" | "signup">("none");
	const loginForm = useForm<LoginFormData>({
		resolver: arktypeResolver(loginSchema),
		mode: "onSubmit",
	});
	const signupForm = useForm<SignupFormData>({
		resolver: arktypeResolver(signupSchema),
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: { city: "", state: "" },
	});
	const [loginFeedback, setLoginFeedback] = useState<string | null>(null);
	const [loginLoading, setLoginLoading] = useState(false);
	const [signupFeedback, setSignupFeedback] = useState<string | null>(null);
	const [signupLoading, setSignupLoading] = useState(false);
	const [logoutLoading, setLogoutLoading] = useState(false);
	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showSignupPassword, setShowSignupPassword] = useState(false);
	const [showSignupConfirmPassword, setShowSignupConfirmPassword] =
		useState(false);

	const onLoginSubmit = async (data: LoginFormData) => {
		setLoginLoading(true);
		setLoginFeedback(null);
		const result = await login(data);
		if (result.success) {
			setLoginFeedback("Login successful!");
			setShowAuth("none");
			window.location.reload();
		} else {
			setLoginFeedback(result.error || "Login failed");
		}
		setLoginLoading(false);
	};

	const onSignupSubmit = async (data: SignupFormData) => {
		if (data.password !== data.confirmPassword) {
			signupForm.setError("confirmPassword", {
				type: "validate",
				message: "Passwords do not match",
			});
			setSignupLoading(false);
			return;
		}
		setSignupLoading(true);
		setSignupFeedback(null);
		const result = await signup({
			email: data.email,
			password: data.password,
			name: data.name,
			city: data.city,
			state: data.state,
		});
		if (result.success) {
			setSignupFeedback("Signup successful! You are now logged in.");
			setShowAuth("none");
			window.location.reload();
		} else {
			setSignupFeedback(result.error || "Signup failed");
		}
		setSignupLoading(false);
	};

	const onLogout = async () => {
		setLogoutLoading(true);
		await logout();
		setLogoutLoading(false);
		window.location.reload();
	};

	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
			{/* Hero Section */}
			<header className="w-full px-4 py-6 flex justify-between items-center max-w-4xl mx-auto">
				<div className="flex items-center gap-2">
					<Image
						src="/logo.svg"
						alt="TasteCheq Logo"
						width={40}
						height={40}
						className="rounded"
					/>
					<span className="text-2xl font-bold text-blue-700">TasteCheq</span>
				</div>
				{!user ? (
					<div className="flex gap-2">
						<Button onClick={() => setShowAuth("signup")}>Sign Up</Button>
						<Button variant="outline" onClick={() => setShowAuth("login")}>
							Sign In
						</Button>
					</div>
				) : (
					<div className="flex gap-2 items-center">
						<span className="text-blue-700 font-semibold">
							Welcome, {user.name}!
						</span>
						<Button
							onClick={onLogout}
							disabled={logoutLoading}
							variant="secondary"
						>
							{logoutLoading ? "Logging out..." : "Logout"}
						</Button>
					</div>
				)}
			</header>

			{/* Main Hero */}
			<main className="flex-1 flex flex-col items-center justify-center text-center px-4">
				<div className="max-w-2xl mx-auto">
					<h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-4">
						Scan, Record, and Rate Menu Items Anywhere
					</h1>
					<p className="text-lg text-gray-700 mb-8">
						TasteCheq lets you quickly scan menus, record what you try, and rate
						your favorite dishes and drinks at restaurants, bars, and more.
						Discover, remember, and share your taste adventures—all from your
						phone.
					</p>
					{!user && (
						<div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
							<Button size="lg" onClick={() => setShowAuth("signup")}>
								Get Started Free
							</Button>
							<Button
								size="lg"
								variant="outline"
								onClick={() => setShowAuth("login")}
							>
								Sign In
							</Button>
						</div>
					)}
					<Image
						src="/hero-menu.svg"
						alt="Menu scanning illustration"
						width={400}
						height={220}
						className="mx-auto mb-8"
					/>
				</div>

				{/* How it works */}
				<section className="w-full max-w-3xl mx-auto mt-12">
					<h2 className="text-2xl font-bold text-blue-700 mb-6">
						How it works
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
						<div className="flex flex-col items-center">
							<div className="bg-blue-100 rounded-full p-4 mb-3">
								<Image src="/scan-icon.svg" alt="Scan" width={48} height={48} />
							</div>
							<h3 className="font-semibold text-lg mb-2">Scan</h3>
							<p className="text-gray-600">
								Use your phone to scan menus with OCR for instant item capture.
							</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="bg-blue-100 rounded-full p-4 mb-3">
								<Image
									src="/record-icon.svg"
									alt="Record"
									width={48}
									height={48}
								/>
							</div>
							<h3 className="font-semibold text-lg mb-2">Record</h3>
							<p className="text-gray-600">
								Save what you try, add notes, and organize by venue or category.
							</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="bg-blue-100 rounded-full p-4 mb-3">
								<Image src="/rate-icon.svg" alt="Rate" width={48} height={48} />
							</div>
							<h3 className="font-semibold text-lg mb-2">Rate</h3>
							<p className="text-gray-600">
								Give star ratings and reviews to remember your favorites and
								share with friends.
							</p>
						</div>
					</div>
				</section>
			</main>

			{/* Auth Modal using shadcn/ui Dialog */}
			<Dialog
				open={showAuth !== "none"}
				onOpenChange={(open) => setShowAuth(open ? showAuth : "none")}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{showAuth === "login" ? "Sign In" : "Sign Up"}
						</DialogTitle>
					</DialogHeader>
					{showAuth === "login" && (
						<Form {...loginForm}>
							<form
								onSubmit={loginForm.handleSubmit(onLoginSubmit)}
								className="space-y-4"
							>
								<FormField
									control={loginForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input type="email" placeholder="Email" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={loginForm.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showLoginPassword ? "text" : "password"}
														placeholder="Password"
														{...field}
													/>
													<button
														type="button"
														className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
														tabIndex={-1}
														onClick={() => setShowLoginPassword((v) => !v)}
														aria-label={
															showLoginPassword
																? "Hide password"
																: "Show password"
														}
													>
														{showLoginPassword ? "Hide" : "Show"}
													</button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-full"
									disabled={loginLoading}
								>
									{loginLoading ? "Signing in..." : "Sign In"}
								</Button>
								{loginFeedback && (
									<div className="text-center text-sm mt-2 text-blue-700">
										{loginFeedback}
									</div>
								)}
							</form>
						</Form>
					)}
					{showAuth === "signup" && (
						<Form {...signupForm}>
							<form
								onSubmit={signupForm.handleSubmit(onSignupSubmit)}
								className="space-y-4"
							>
								<FormField
									control={signupForm.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<FormControl>
												<Input type="text" placeholder="Name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={signupForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input type="email" placeholder="Email" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={signupForm.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showSignupPassword ? "text" : "password"}
														placeholder="Password"
														{...field}
													/>
													<button
														type="button"
														className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
														tabIndex={-1}
														onClick={() => setShowSignupPassword((v) => !v)}
														aria-label={
															showSignupPassword
																? "Hide password"
																: "Show password"
														}
													>
														{showSignupPassword ? "Hide" : "Show"}
													</button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={signupForm.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={
															showSignupConfirmPassword ? "text" : "password"
														}
														placeholder="Confirm Password"
														{...field}
													/>
													<button
														type="button"
														className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
														tabIndex={-1}
														onClick={() =>
															setShowSignupConfirmPassword((v) => !v)
														}
														aria-label={
															showSignupConfirmPassword
																? "Hide password"
																: "Show password"
														}
													>
														{showSignupConfirmPassword ? "Hide" : "Show"}
													</button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="flex gap-2">
									<FormField
										control={signupForm.control}
										name="city"
										render={({ field }) => (
											<FormItem className="flex-1">
												<FormLabel>City</FormLabel>
												<FormControl>
													<Input type="text" placeholder="City" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={signupForm.control}
										name="state"
										render={({ field }) => (
											<FormItem className="flex-1">
												<FormLabel>State</FormLabel>
												<FormControl>
													<Input type="text" placeholder="State" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<Button
									type="submit"
									className="w-full"
									disabled={signupLoading}
								>
									{signupLoading ? "Signing up..." : "Sign Up"}
								</Button>
								{signupFeedback && (
									<div className="text-center text-sm mt-2 text-blue-700">
										{signupFeedback}
									</div>
								)}
							</form>
						</Form>
					)}
				</DialogContent>
			</Dialog>

			{/* Footer */}
			<footer className="w-full py-8 bg-blue-900 text-white text-center mt-16">
				<div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
					<div className="flex items-center gap-2">
						<Image
							src="/logo.svg"
							alt="TasteCheq Logo"
							width={32}
							height={32}
							className="rounded"
						/>
						<span className="font-bold text-lg">TasteCheq</span>
					</div>
					<div className="flex gap-6 text-sm">
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
					<div className="text-xs text-blue-200">
						&copy; {new Date().getFullYear()} TasteCheq. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;
