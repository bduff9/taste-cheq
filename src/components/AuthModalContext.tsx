import { login } from "@/app/auth/login-action";
import { signup } from "@/app/auth/signup-action";
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
import { useRouter } from "next/navigation";
import {
	type ReactNode,
	createContext,
	useContext,
	useState as useReactState,
	useState,
} from "react";
import { useForm } from "react-hook-form";

interface AuthModalContextType {
	open: (redirectTo?: string) => void;
	close: () => void;
	isOpen: boolean;
	redirectTo: string | null;
}

const AuthModalContext = createContext<AuthModalContextType>({
	open: () => {},
	close: () => {},
	isOpen: false,
	redirectTo: null,
});

export const useAuthModal = () => useContext(AuthModalContext);

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

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [redirectTo, setRedirectTo] = useState<string | null>(null);
	const [mode, setMode] = useReactState<"login" | "signup">("login");
	const [loginFeedback, setLoginFeedback] = useReactState<string | null>(null);
	const [loginLoading, setLoginLoading] = useReactState(false);
	const [signupFeedback, setSignupFeedback] = useReactState<string | null>(
		null,
	);
	const [signupLoading, setSignupLoading] = useReactState(false);
	const [showLoginPassword, setShowLoginPassword] = useReactState(false);
	const [showSignupPassword, setShowSignupPassword] = useReactState(false);
	const [showSignupConfirmPassword, setShowSignupConfirmPassword] =
		useReactState(false);
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
	const router = useRouter();

	const open = (redirect?: string) => {
		setRedirectTo(redirect || null);
		setIsOpen(true);
	};
	const close = () => setIsOpen(false);

	const onLoginSubmit = async (data: LoginFormData) => {
		setLoginLoading(true);
		setLoginFeedback(null);
		const result = await login(data);
		if (result.success) {
			setLoginFeedback("Login successful!");
			setIsOpen(false);
			if (redirectTo) router.push(redirectTo);
			else window.location.reload();
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
			setIsOpen(false);
			if (redirectTo) router.push(redirectTo);
			else window.location.reload();
		} else {
			setSignupFeedback(result.error || "Signup failed");
		}
		setSignupLoading(false);
	};

	return (
		<AuthModalContext.Provider value={{ open, close, isOpen, redirectTo }}>
			{children}
			<Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{mode === "login" ? "Sign In" : "Sign Up"}
						</DialogTitle>
					</DialogHeader>
					<div className="flex gap-4 mb-4 justify-center">
						<Button
							type="button"
							variant={mode === "login" ? "default" : "outline"}
							onClick={() => setMode("login")}
						>
							Sign In
						</Button>
						<Button
							type="button"
							variant={mode === "signup" ? "default" : "outline"}
							onClick={() => setMode("signup")}
						>
							Sign Up
						</Button>
					</div>
					{mode === "login" && (
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
					{mode === "signup" && (
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
		</AuthModalContext.Provider>
	);
};
