import UserReviewCard from "@/components/UserReviewCard";
import { getUserFromSessionCookie } from "@/lib/auth";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import ProfileNav from "./ProfileNav";
import UpgradeAlert from "./UpgradeAlert";
import UpgradeModal from "./UpgradeModal";
import {
	type UserRatingWithRestaurant,
	getUserRatingsWithRestaurants,
} from "./get-user-ratings";
import { getPaidStatus } from "./paid-status";

export default async function ProfilePage() {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) {
		redirect("/auth");
	}
	const isPaid = await getPaidStatus();
	const ratings: UserRatingWithRestaurant[] =
		await getUserRatingsWithRestaurants();
	// Group by restaurant
	type GroupedRestaurant = {
		id: string;
		name: string;
		address: string;
		items: Array<{
			id: string;
			name: string;
			price?: string;
			description?: string;
			stars: number;
			text?: string;
			created: Date;
			updated?: Date;
		}>;
	};
	const grouped: Record<string, GroupedRestaurant> = ratings.reduce(
		(acc, r) => {
			const key = r.restaurant.id;
			if (!acc[key]) acc[key] = { ...r.restaurant, items: [] };
			acc[key].items.push({
				id: r.menuItem.id,
				name: r.menuItem.name,
				price: r.menuItem.price,
				description: r.menuItem.description,
				stars: r.rating.stars,
				text: r.rating.text,
				created: r.rating.created,
				updated: r.rating.updated,
			});
			return acc;
		},
		{} as Record<string, GroupedRestaurant>,
	);
	const recent = ratings.slice(0, 5);
	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
			<ProfileNav />
			<main className="flex-1 flex flex-col items-center justify-center px-4">
				<div className="max-w-md w-full bg-white rounded-lg shadow p-6 mt-8 mb-8 space-y-6">
					<UpgradeAlert />
					<h1 className="text-2xl font-bold mb-2">Profile</h1>
					<div className="mb-4">
						<span className="font-medium">Status:</span>{" "}
						{isPaid ? (
							<span className="text-green-600 font-semibold">Pro (Paid)</span>
						) : (
							<span className="text-yellow-600 font-semibold">Free</span>
						)}
					</div>
					{!isPaid && <UpgradeModal />}
					{isPaid && (
						<div className="bg-green-50 border border-green-200 rounded p-4 text-green-800">
							Thank you for supporting TasteCheq! You have unlimited access to
							all features.
						</div>
					)}
					<ProfileForm />

					{/* My Ratings & Reviews Section */}
					<div className="mt-8">
						<h2 className="text-xl font-bold mb-4">My Ratings & Reviews</h2>
						{ratings.length === 0 && (
							<p className="text-muted-foreground">
								You haven't rated any menu items yet.
							</p>
						)}
						{Object.values(grouped)
							.slice(0, 2)
							.map((restaurant) => (
								<div key={restaurant.id} className="mb-6">
									<div className="font-semibold text-blue-700">
										{restaurant.name}
									</div>
									<div className="text-xs text-muted-foreground mb-2">
										{restaurant.address}
									</div>
									<div className="space-y-2">
										{restaurant.items.slice(0, 3).map((item) => (
											<UserReviewCard
												key={item.id}
												itemName={item.name}
												stars={item.stars}
												price={item.price}
												description={item.description}
												review={item.text}
												date={item.updated || item.created}
												showEdit={true}
												editHref={`/scan?restaurantId=${restaurant.id}&step=3`}
											/>
										))}
									</div>
								</div>
							))}
						{ratings.length > 5 && (
							<Link
								href="/profile/history"
								className="mt-4 text-blue-700 underline text-sm block"
							>
								See all
							</Link>
						)}
					</div>
				</div>
			</main>
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
						<a href="/profile" className="hover:underline">
							Profile
						</a>
					</div>
					<div className="text-xs text-blue-200">
						&copy; {new Date().getFullYear()} TasteCheq. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
