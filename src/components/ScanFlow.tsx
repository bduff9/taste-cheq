import {
	getMenuItemsWithAggregates,
	getUserMenuItemRatings,
	getUserTriedItems,
} from "@/app/menu-item-rating-actions";
import { db } from "@/lib/db";
import ScanFlowClient from "./ScanFlowClient";

type Restaurant = {
	id?: string;
	name: string;
	address: string;
	location?: { lat: number; lng: number };
};

// Types for menu items, ratings, and tried items
type MenuItem = {
	id: string;
	name: string;
	price?: string;
	description?: string;
	category: string;
	subCategory?: string;
};
type UserTriedItem = {
	menuItemId: string;
};
type UserRating = {
	menuItemId: string;
	stars: number;
	text?: string;
};

export default async function ScanFlow({
	searchParams,
}: {
	searchParams: Promise<{ step?: string; restaurantId?: string }>;
}) {
	const params = await searchParams;
	const step = Number(params.step ?? 1);
	const restaurantId = params.restaurantId ?? null;
	let restaurant: Restaurant | null = null;
	let menuItems: MenuItem[] = [];
	let userRatings: UserRating[] = [];
	let userTriedItems: UserTriedItem[] = [];

	if (restaurantId) {
		// Fetch restaurant
		const r = await db
			.selectFrom("Restaurant")
			.select(["id", "name", "address", "latitude", "longitude"])
			.where("id", "=", restaurantId)
			.where("deleted", "is", null)
			.executeTakeFirst();
		if (r) {
			restaurant = {
				id: r.id,
				name: r.name,
				address: r.address,
				location: { lat: r.latitude, lng: r.longitude },
			};
		}
		// Fetch menu items with aggregates
		menuItems = (await getMenuItemsWithAggregates(restaurantId)).map(
			(item) => ({
				...item,
				price: item.price ?? undefined,
				description: item.description ?? undefined,
				avgStars: item.avgStars ?? null,
				reviewCount: item.reviewCount ?? 0,
				category: item.category ?? "",
				subCategory: item.subCategory ?? undefined,
			}),
		);
		// Fetch user ratings and tried items
		userRatings = (await getUserMenuItemRatings(restaurantId)).map((r) => ({
			...r,
			stars: Number(r.stars),
			text: r.text ?? undefined,
		}));
		userTriedItems = await getUserTriedItems(restaurantId);
	}

	const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

	return (
		<ScanFlowClient
			initialStep={step}
			initialRestaurant={restaurant}
			menuItems={menuItems}
			userRatings={userRatings}
			userTriedItems={userTriedItems}
			GOOGLE_MAPS_API_KEY={GOOGLE_MAPS_API_KEY}
		/>
	);
}
