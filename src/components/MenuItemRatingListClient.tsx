"use client";
import {
	setMenuItemTried,
	upsertMenuItemRating,
} from "@/app/menu-item-rating-actions";
import dynamic from "next/dynamic";
import { type FC, useState, useTransition } from "react";

const MenuItemRatingList = dynamic(() => import("./MenuItemRatingList"), {
	ssr: false,
});

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

type MenuItemRatingListClientProps = {
	menuItems: MenuItem[];
	userRatings: UserRating[];
	userTriedItems: UserTriedItem[];
};

const MenuItemRatingListClient: FC<MenuItemRatingListClientProps> = ({
	menuItems,
	userRatings,
	userTriedItems,
}) => {
	const [pending, startTransition] = useTransition();
	const [ratings, setRatings] = useState<UserRating[]>(userRatings);
	const [triedItems, setTriedItems] = useState<UserTriedItem[]>(userTriedItems);

	const handleTriedChange = (menuItemId: string, tried: boolean) => {
		startTransition(async () => {
			await setMenuItemTried({ menuItemId, tried });
			setTriedItems((prev) => {
				if (tried) {
					return [...prev, { menuItemId }];
				}
				return prev.filter((t) => t.menuItemId !== menuItemId);
			});
		});
	};

	const handleRatingChange = (menuItemId: string, stars: number) => {
		startTransition(async () => {
			await upsertMenuItemRating({ menuItemId, stars });
			setRatings((prev) => {
				const existing = prev.find((r) => r.menuItemId === menuItemId);
				if (existing) {
					return prev.map((r) =>
						r.menuItemId === menuItemId ? { ...r, stars } : r,
					);
				}
				return [...prev, { menuItemId, stars }];
			});
		});
	};

	const handleReviewSubmit = (menuItemId: string, review: string) => {
		startTransition(async () => {
			// Find current stars value
			const current = ratings.find((r) => r.menuItemId === menuItemId);
			const stars = current?.stars || 1;
			await upsertMenuItemRating({ menuItemId, stars, text: review });
			setRatings((prev) => {
				const existing = prev.find((r) => r.menuItemId === menuItemId);
				if (existing) {
					return prev.map((r) =>
						r.menuItemId === menuItemId ? { ...r, text: review } : r,
					);
				}
				return [...prev, { menuItemId, stars, text: review }];
			});
		});
	};

	return (
		<MenuItemRatingList
			menuItems={menuItems}
			userRatings={ratings}
			userTriedItems={triedItems}
			loading={pending}
			onTriedChange={handleTriedChange}
			onRatingChange={handleRatingChange}
			onReviewSubmit={handleReviewSubmit}
		/>
	);
};

export default MenuItemRatingListClient;
