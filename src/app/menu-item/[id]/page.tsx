import {
	getMenuItemReviews,
	getMenuItemWithAggregates,
} from "@/app/menu-item-rating-actions";
import { getUserFromSessionCookie } from "@/lib/auth";
import { Star } from "lucide-react";
import { cookies } from "next/headers";
import type { FC } from "react";
import MenuItemDetailBackButton from "./MenuItemDetailBackButton";

const renderStars = (stars: number) => {
	const arr = [];
	for (let i = 1; i <= 5; i++) {
		if (stars >= i) {
			arr.push(
				<Star
					key={i}
					size={18}
					fill="#facc15"
					className="text-yellow-500 inline"
				/>,
			);
		} else if (stars >= i - 0.5) {
			arr.push(
				<span
					key={i}
					className="relative inline-block w-[9px] h-[18px] align-middle"
				>
					<Star size={18} fill="none" className="text-gray-300" />
					<span
						className="absolute left-0 top-0 h-full"
						style={{
							width: "9px",
							overflow: "hidden",
							display: "inline-block",
						}}
					>
						<Star size={18} fill="#facc15" className="text-yellow-500" />
					</span>
				</span>,
			);
		} else {
			arr.push(
				<Star key={i} size={18} fill="none" className="text-gray-300 inline" />,
			);
		}
	}
	return arr;
};

const MenuItemDetailPage: FC<{ params: Promise<{ id: string }> }> = async ({
	params,
}) => {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("session")?.value;
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) {
		// @ts-expect-error
		return redirect("/auth");
	}
	const urlParams = await params;
	const menuItemId = urlParams.id;
	const item = await getMenuItemWithAggregates(menuItemId);
	const reviews = await getMenuItemReviews(menuItemId);

	if (!item) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center">
				<div className="bg-white rounded shadow p-8 mt-16">
					<div className="text-xl font-bold mb-2">Menu Item Not Found</div>
					<MenuItemDetailBackButton />
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-xl mx-auto mt-8 p-4 bg-white rounded shadow">
			<MenuItemDetailBackButton />
			<div className="mb-4">
				<div className="text-2xl font-bold mb-1">{item.name}</div>
				{item.price && (
					<div className="text-base text-muted-foreground mb-1">
						{item.price}
					</div>
				)}
				{item.description && (
					<div className="text-sm text-muted-foreground mb-2">
						{item.description}
					</div>
				)}
				<div className="flex items-center gap-2 mt-2">
					{typeof item.avgStars === "number" && item.reviewCount > 0 ? (
						<>
							<span className="flex items-center">
								{renderStars(item.avgStars)}
							</span>
							<span className="text-xs text-gray-500 ml-1">
								{item.avgStars.toFixed(1)}/5
							</span>
							<span className="text-xs text-gray-400 ml-1">
								({item.reviewCount})
							</span>
						</>
					) : (
						<span className="text-xs text-gray-400">No reviews</span>
					)}
				</div>
			</div>
			<div>
				<div className="text-lg font-semibold mb-2">Reviews</div>
				{reviews.length === 0 ? (
					<div className="text-gray-500">No reviews yet.</div>
				) : (
					<ul className="space-y-4">
						{reviews.map((review, idx) => (
							<li
								key={
									review.user?.id && review.created
										? `${review.user.id}-${review.created}`
										: idx
								}
								className="border-b pb-2"
							>
								<div className="flex items-center gap-2 mb-1">
									{renderStars(review.stars)}
									<span className="text-xs text-gray-500">
										{review.user.name}
									</span>
									<span className="text-xs text-gray-400">
										{new Date(review.created).toLocaleDateString()}
									</span>
								</div>
								{review.text && (
									<div className="text-sm text-gray-700">{review.text}</div>
								)}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default MenuItemDetailPage;
