import UserReviewCard from "@/components/UserReviewCard";
import { getUserFromSessionCookie } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
	type UserRatingWithRestaurant,
	getUserRatingsWithRestaurants,
} from "../get-user-ratings";

export default async function ProfileHistoryPage() {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) {
		redirect("/auth");
	}
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
			category?: string;
			subCategory?: string;
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
				category: r.menuItem.category,
				subCategory: r.menuItem.subCategory,
			});
			return acc;
		},
		{} as Record<string, GroupedRestaurant>,
	);

	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
			<main className="flex-1 flex flex-col items-center justify-center px-4">
				<div className="max-w-2xl w-full bg-white rounded-lg shadow p-6 mt-8 mb-8 space-y-6">
					<div className="mb-4">
						<Link href="/profile" className="text-blue-700 underline text-sm">
							&larr; Back to Profile
						</Link>
					</div>
					<h1 className="text-2xl font-bold mb-6">My Full Ratings & Reviews</h1>
					{ratings.length === 0 && (
						<p className="text-muted-foreground">
							You haven't rated any menu items yet.
						</p>
					)}
					{Object.values(grouped).map((restaurant) => (
						<div key={restaurant.id} className="mb-8">
							<div className="font-semibold text-blue-700 text-lg">
								{restaurant.name}
							</div>
							<div className="text-xs text-muted-foreground mb-2">
								{restaurant.address}
							</div>
							<div className="space-y-2">
								{restaurant.items.map((item) => (
									<UserReviewCard
										key={item.id}
										itemName={item.name}
										stars={item.stars}
										price={formatPrice(item.price)}
										description={item.description}
										review={item.text}
										date={item.updated || item.created}
										showEdit={true}
										editHref={`/scan?restaurantId=${restaurant.id}&step=3`}
										category={item.category}
										subCategory={item.subCategory}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
}
