"use client";
import { addRestaurantAction } from "@/app/restaurant-add-action";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { type FC, useEffect, useState } from "react";
import MenuItemRatingListClient from "./MenuItemRatingListClient";
import MenuReview from "./MenuReview";
import RestaurantSelect from "./RestaurantSelect";

type Restaurant = {
	id?: string;
	name: string;
	address: string;
	location?: { lat: number; lng: number };
};
type MenuItem = {
	id: string;
	name: string;
	price?: string;
	description?: string;
};
type UserTriedItem = {
	menuItemId: string;
};
type UserRating = {
	menuItemId: string;
	stars: number;
	text?: string;
};

type ScanFlowClientProps = {
	initialStep: number;
	initialRestaurant: Restaurant | null;
	initialRestaurantId: string | null;
	menuItems: MenuItem[];
	userRatings: UserRating[];
	userTriedItems: UserTriedItem[];
	GOOGLE_MAPS_API_KEY: string;
};

const ScanFlowClient: FC<ScanFlowClientProps> = ({
	initialStep,
	initialRestaurant,
	initialRestaurantId,
	menuItems,
	userRatings,
	userTriedItems,
	GOOGLE_MAPS_API_KEY,
}) => {
	const [step, setStep] = useQueryState("step", {
		defaultValue: initialStep,
		history: "replace",
		parse: Number,
		serialize: (v) => String(v),
	});
	const [restaurant, setRestaurant] = useState<Restaurant | null>(
		initialRestaurant,
	);
	const [restaurantId, setRestaurantId] = useQueryState("restaurantId", {
		history: "replace",
	});
	const [ratings, setRatings] = useState<UserRating[]>(userRatings);
	const [triedItems, setTriedItems] = useState<UserTriedItem[]>(userTriedItems);
	const steps = [
		{ label: "Restaurant" },
		{ label: "Menu Items" },
		{ label: "Rate" },
	];
	const router = useRouter();

	// Always reset ratings and triedItems from props when userRatings or userTriedItems change
	useEffect(() => {
		setRatings(userRatings);
		setTriedItems(userTriedItems);
	}, [userRatings, userTriedItems]);

	// Debug: log menuItems when rendering step 3
	if (typeof window !== "undefined" && step === 3) {
		// eslint-disable-next-line no-console
		console.log("Step 3 menuItems:", menuItems);
	}

	return (
		<div className="max-w-xl mx-auto p-4">
			{/* Step Indicator */}
			<div className="flex items-center justify-center gap-4 mb-8">
				{steps.map((s, i) => {
					const idx = i + 1;
					const active = step === idx;
					const complete = step > idx;
					return (
						<div key={s.label} className="flex items-center gap-2">
							<div
								className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 transition-colors
                  ${active ? "bg-blue-700 text-white border-blue-700" : complete ? "bg-blue-200 text-blue-700 border-blue-400" : "bg-gray-100 text-gray-400 border-gray-300"}
                `}
							>
								{idx}
							</div>
							<span
								className={`text-sm font-medium ${active ? "text-blue-700" : complete ? "text-blue-400" : "text-gray-400"}`}
							>
								{s.label}
							</span>
							{i < steps.length - 1 && (
								<div
									className={`w-8 h-1 rounded ${step > idx ? "bg-blue-400" : "bg-gray-200"}`}
								/>
							)}
						</div>
					);
				})}
			</div>
			{/* Step Content */}
			{step === 1 && (
				<RestaurantSelect
					googleMapsApiKey={GOOGLE_MAPS_API_KEY}
					onSelect={async (r) => {
						if (!r.id) {
							const created = await addRestaurantAction(r);
							if (created?.id) {
								setRestaurant(created);
								setRestaurantId(created?.id);
								setStep(2);
							}
						} else {
							setRestaurant(r);
							setRestaurantId(r?.id);
							setStep(2);
						}
					}}
				/>
			)}
			{step === 2 && restaurant?.id && (
				<MenuReview
					restaurant={restaurant}
					onContinue={() => {
						router.push(`?step=3&restaurantId=${restaurant.id}`);
					}}
					onBack={() => setStep(1)}
				/>
			)}
			{step === 3 && restaurant?.id && (
				<div>
					<h2 className="text-xl font-bold mb-4">Rate Items</h2>
					{menuItems.length === 0 ? (
						<div className="text-gray-500">
							No menu items found for this restaurant.
						</div>
					) : (
						<MenuItemRatingListClient
							key={`rate-${restaurant.id}-${step}`}
							menuItems={menuItems}
							userRatings={ratings}
							userTriedItems={triedItems}
						/>
					)}
					<Button
						className="mt-4 mr-4"
						onClick={() => setStep(2)}
						type="button"
						variant="secondary"
					>
						Back
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							setStep(1);
							setRestaurant(null);
							setRestaurantId(null);
							setRatings([]);
							setTriedItems([]);
						}}
						className="mt-4"
					>
						Start Over
					</Button>
				</div>
			)}
		</div>
	);
};

export default ScanFlowClient;
