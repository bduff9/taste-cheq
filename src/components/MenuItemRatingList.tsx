"use client";
import { type FC, useEffect, useRef, useState } from "react";
import MenuItemRatingCard from "./MenuItemRatingCard";

type MenuItem = {
	id: string;
	name: string;
	price?: string;
	description?: string;
	avgStars?: number | null;
	reviewCount?: number;
};

type UserTriedItem = {
	menuItemId: string;
};

type UserRating = {
	menuItemId: string;
	stars: number;
	text?: string;
};

type MenuItemRatingListProps = {
	menuItems: MenuItem[];
	userTriedItems: UserTriedItem[];
	userRatings: UserRating[];
	loading?: boolean;
	onTriedChange: (menuItemId: string, tried: boolean) => void;
	onRatingChange: (menuItemId: string, stars: number) => void;
	onReviewSubmit: (menuItemId: string, review: string) => void;
};

const MenuItemRatingList: FC<MenuItemRatingListProps> = ({
	menuItems,
	userTriedItems,
	userRatings,
	loading,
	onTriedChange,
	onRatingChange,
	onReviewSubmit,
}) => {
	const didInit = useRef(false);
	const [triedMap, setTriedMap] = useState<Record<string, boolean>>({});
	const [ratingMap, setRatingMap] = useState<
		Record<string, number | string | undefined>
	>({});
	const [reviewMap, setReviewMap] = useState<
		Record<string, string | undefined>
	>({});

	// Initialize local state from props only on first render
	useEffect(() => {
		if (!didInit.current) {
			const t: Record<string, boolean> = {};
			const r: Record<string, number | string | undefined> = {};
			const rev: Record<string, string | undefined> = {};
			for (const item of menuItems) {
				t[item.id] = userTriedItems.some((u) => u.menuItemId === item.id);
				const ratingObj = userRatings.find((u) => u.menuItemId === item.id);
				r[item.id] = ratingObj?.stars;
				rev[item.id] = ratingObj?.text;
			}
			setTriedMap(t);
			setRatingMap(r);
			setReviewMap(rev);
			didInit.current = true;
		}
	}, [menuItems, userTriedItems, userRatings]);

	const handleTriedChange = (id: string, tried: boolean) => {
		setTriedMap((prev) => ({ ...prev, [id]: tried }));
		onTriedChange(id, tried);
		if (!tried) {
			setRatingMap((prev) => ({ ...prev, [id]: undefined }));
			setReviewMap((prev) => ({ ...prev, [id]: "" }));
		}
	};

	const handleRatingChange = (id: string, stars: number) => {
		setRatingMap((prev) => ({ ...prev, [id]: stars }));
		onRatingChange(id, stars);
	};

	const handleReviewSubmit = (id: string, review: string) => {
		setReviewMap((prev) => ({ ...prev, [id]: review }));
		onReviewSubmit(id, review);
	};

	return (
		<div className="flex flex-col gap-2">
			{menuItems.map((item) => (
				<MenuItemRatingCard
					key={item.id}
					menuItem={item}
					isTried={triedMap[item.id]}
					rating={ratingMap[item.id]}
					review={reviewMap[item.id]}
					loading={loading}
					onTriedChange={(tried) => handleTriedChange(item.id, tried)}
					onRatingChange={(stars) => handleRatingChange(item.id, stars)}
					onReviewSubmit={(review) => handleReviewSubmit(item.id, review)}
					avgStars={item.avgStars}
					reviewCount={item.reviewCount}
				/>
			))}
		</div>
	);
};

export default MenuItemRatingList;
