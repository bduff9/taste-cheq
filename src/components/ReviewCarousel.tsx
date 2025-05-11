"use client";
import { Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Review = {
	ratingId: string;
	stars: number;
	text?: string;
	created: string | Date;
	menuItem: { id: string; name: string; price?: string; description?: string };
	restaurant: { id: string; name: string };
	user: { id: string; name: string; avatarUrl?: string };
};

type ReviewCarouselProps = {
	reviews: Review[];
	user: { id: string; name: string; email: string; isAdmin?: boolean } | null;
};

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

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ reviews, user }) => {
	const [index, setIndex] = useState(0);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const router = useRouter();

	// Autoplay logic
	useEffect(() => {
		if (reviews.length <= 1) return;
		intervalRef.current = setInterval(() => {
			setIndex((i) => (i + 1) % reviews.length);
		}, 5000);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [reviews.length]);

	// Pause on hover
	const handleMouseEnter = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};
	const handleMouseLeave = () => {
		if (reviews.length <= 1) return;
		intervalRef.current = setInterval(() => {
			setIndex((i) => (i + 1) % reviews.length);
		}, 5000);
	};

	// Click handler
	const handleClick = useCallback(
		(review: Review) => {
			if (!user) {
				// Redirect to sign in, then to menu item page
				router.push(`/auth?redirect=/menu-item/${review.menuItem.id}`);
			} else {
				router.push(`/menu-item/${review.menuItem.id}`);
			}
		},
		[user, router],
	);

	// Keyboard accessibility handler
	const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			handleClick(reviews[index]);
		}
	};

	if (!reviews.length) return null;
	const review = reviews[index];

	return (
		<div
			role="button"
			tabIndex={0}
			className="relative w-full max-w-xl mx-auto flex flex-col items-center group cursor-pointer focus:outline-none"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={() => handleClick(review)}
			onKeyUp={handleKeyUp}
			aria-label="View menu item and all reviews"
		>
			<div className="bg-blue-50 rounded-lg shadow p-6 w-full transition-all duration-300 hover:shadow-xl border border-blue-100">
				<div className="flex items-center gap-3 mb-2">
					{review.user.avatarUrl ? (
						<Image
							src={review.user.avatarUrl}
							alt={review.user.name}
							width={32}
							height={32}
							className="rounded-full border"
						/>
					) : (
						<div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">
							{review.user.name[0]}
						</div>
					)}
					<span className="font-semibold text-blue-900">
						{review.user.name}
					</span>
					<span className="ml-2 text-xs text-gray-500">
						{new Date(review.created).toLocaleDateString()}
					</span>
				</div>
				<div className="flex items-center gap-2 mb-1">
					{renderStars(review.stars)}
					<span className="ml-2 text-xs text-gray-600 font-medium">
						{review.stars.toFixed(1)}/5
					</span>
				</div>
				{review.text && (
					<div className="italic text-lg text-gray-800 mb-2 truncate-lines-2">
						"{review.text}"
					</div>
				)}
				<div className="text-sm text-blue-700 font-semibold">
					{review.menuItem.name}
				</div>
				{review.menuItem.description && (
					<div className="text-xs text-gray-500 mb-1">
						{review.menuItem.description}
					</div>
				)}
				<div className="text-xs text-gray-400">
					at{" "}
					<span className="font-medium text-blue-800">
						{review.restaurant.name}
					</span>
				</div>
			</div>
			{/* Carousel dots */}
			<div className="flex gap-2 justify-center mt-4">
				{reviews.map((r, i) => (
					<button
						key={r.ratingId}
						type="button"
						className={`w-2 h-2 rounded-full transition-all duration-200 ${
							i === index ? "bg-blue-700" : "bg-blue-200"
						}`}
						aria-label={`Show review ${i + 1}`}
						onClick={(e) => {
							e.stopPropagation();
							setIndex(i);
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default ReviewCarousel;
