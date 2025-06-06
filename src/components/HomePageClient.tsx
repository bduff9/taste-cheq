"use client";
import { login } from "@/app/auth/login-action";
import { signup } from "@/app/auth/signup-action";
import ProfileNavClient from "@/app/profile/ProfileNavClient";
import { AuthModalProvider } from "@/components/AuthModalContext";
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Review } from "./ReviewCarousel";
import ReviewCarousel from "./ReviewCarousel";

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
	state: "string==2",
});

type SignupFormData = typeof signupSchema.infer;

type HomePageClientProps = {
	user: { id: string; name: string; email: string; isAdmin?: boolean } | null;
	latestReviews: Review[];
};

const HomePageClient = ({ user, latestReviews }: HomePageClientProps) => {
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
	const pathname = usePathname();

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

	return (
		<AuthModalProvider>
			<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white overflow-x-hidden">
				<ProfileNavClient user={user} />

				{/* Main Hero */}
				<main className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4">
					<div className="max-w-2xl mx-auto">
						<h1 className="text-5xl sm:text-6xl font-extrabold text-blue-900 mb-4 py-8 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 text-transparent bg-clip-text drop-shadow-lg rounded-lg">
							TasteCheq
						</h1>
						<p className="text-2xl font-semibold text-blue-800 mb-4">
							Scan, Record, and Rate Menu Items Anywhere
						</p>
						<p className="text-lg text-gray-700 mb-8">
							TasteCheq lets you quickly scan menus, record what you try, and
							rate your favorite dishes and drinks at restaurants, bars, and
							more. Discover, remember, and share your taste adventures—all from
							your phone.
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
							src="/hero-menu.jpeg"
							alt="Menu scanning illustration"
							width={400}
							height={400}
							className="mx-auto mb-8 rounded-xl shadow-lg"
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
									<Image
										src="/scan-icon.svg"
										alt="Scan"
										width={48}
										height={48}
									/>
								</div>
								<h3 className="font-semibold text-lg mb-2">Scan</h3>
								<p className="text-gray-600">
									Use your phone to scan menus with OCR for instant item
									capture.
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
									Save what you try, add notes, and organize by venue or
									category.
								</p>
							</div>
							<div className="flex flex-col items-center">
								<div className="bg-blue-100 rounded-full p-4 mb-3">
									<Image
										src="/rate-icon.svg"
										alt="Rate"
										width={48}
										height={48}
									/>
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

				{/* Review Carousel */}
				{latestReviews.length > 0 && (
					<div className="w-full bg-white/80 py-8 border-t border-blue-100 mt-8">
						<div className="max-w-2xl mx-auto">
							<h2 className="text-xl font-bold text-blue-800 mb-4 text-center">
								Latest Rave Reviews
							</h2>
							<ReviewCarousel reviews={latestReviews} user={user} />
						</div>
					</div>
				)}

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
					<div className="max-w-4xl mx-auto flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 px-2 sm:px-4">
						<div className="flex items-center gap-2 min-w-0">
							<Image
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
							{user && (
								<a href="/profile" className="hover:underline">
									Profile
								</a>
							)}
						</div>
						<div className="text-xs text-blue-200 min-w-0 truncate">
							&copy; {new Date().getFullYear()} TasteCheq. All rights reserved.
						</div>
					</div>
				</footer>

				{/* Floating Scan Button (FAB) - only show if signed in */}
				{user && pathname !== "/scan" && (
					<Link
						href="/scan"
						className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full shadow-lg bg-blue-700 text-white hover:bg-blue-800 h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center z-50 transition-colors"
						aria-label="Scan a Menu"
					>
						<Image
							src="/scan-icon.svg"
							alt="Scan"
							width={28}
							height={28}
							className="sm:w-9 sm:h-9 w-7 h-7"
						/>
					</Link>
				)}
			</div>
		</AuthModalProvider>
	);
};

export default HomePageClient;
