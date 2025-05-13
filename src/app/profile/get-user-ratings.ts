import { getUserFromSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export type UserRatingWithRestaurant = {
		restaurant: {
			id: string;
			name: string;
			address: string;
		};
		menuItem: {
			id: string;
			name: string;
			price?: string;
			description?: string;
			category?: string;
			subCategory?: string;
		};
		rating: {
			stars: number;
			text?: string;
			created: Date;
			updated?: Date;
		};
	};

export async function getUserRatingsWithRestaurants(): Promise<
	UserRatingWithRestaurant[]
> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	if (!sessionId) return [];
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) return [];

	// Join Rating -> MenuItem -> Restaurant
	const rows = await db
		.selectFrom("Rating")
		.innerJoin("MenuItem", "MenuItem.id", "Rating.menuItemId")
		.innerJoin("Restaurant", "Restaurant.id", "MenuItem.restaurantId")
		.select([
			"Rating.stars as stars",
			"Rating.text as text",
			"Rating.created as created",
			"Rating.updated as updated",
			"MenuItem.id as menuItemId",
			"MenuItem.name as menuItemName",
			"MenuItem.price as menuItemPrice",
			"MenuItem.description as menuItemDescription",
			"MenuItem.category as menuItemCategory",
			"MenuItem.subCategory as menuItemSubCategory",
			"Restaurant.id as restaurantId",
			"Restaurant.name as restaurantName",
			"Restaurant.address as restaurantAddress",
		])
		.where("Rating.userId", "=", user.id)
		.where("Rating.deleted", "is", null)
		.orderBy("Rating.created", "desc")
		.execute();

	return rows.map((row) => ({
		restaurant: {
			id: row.restaurantId,
			name: row.restaurantName,
			address: row.restaurantAddress,
		},
		menuItem: {
			id: row.menuItemId,
			name: row.menuItemName,
			price: row.menuItemPrice ? String(row.menuItemPrice) : undefined,
			description: row.menuItemDescription ?? undefined,
			category: row.menuItemCategory ?? undefined,
			subCategory: row.menuItemSubCategory ?? undefined,
		},
		rating: {
			stars: Number(row.stars),
			text: row.text ?? undefined,
			created: row.created,
			updated: row.updated ?? undefined,
		},
	}));
}
