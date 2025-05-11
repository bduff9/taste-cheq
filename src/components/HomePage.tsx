import { getLatestPositiveReviews } from "@/app/menu-item-rating-actions";
import { type } from "arktype";
import HomePageClient from "./HomePageClient";

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

const HomePage = async ({
	user,
}: {
	user: { id: string; name: string; email: string; isAdmin?: boolean } | null;
}) => {
	const latestReviews = await getLatestPositiveReviews(5);
	return <HomePageClient user={user} latestReviews={latestReviews} />;
};

export default HomePage;
