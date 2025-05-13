"use client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { type } from "arktype";
import { MessageCircle, Star } from "lucide-react";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Arktype schema for review form
const reviewSchema = type({ review: "string<=280?" });
type ReviewForm = typeof reviewSchema.infer;

type MenuItemRatingCardProps = {
	menuItem: {
		id: string;
		name: string;
		price?: string;
		description?: string;
		category?: string;
		subCategory?: string;
	};
	isTried: boolean;
	rating?: number | string; // 1-5, can be string from DB
	review?: string;
	loading?: boolean;
	onTriedChange: (tried: boolean) => void;
	onRatingChange: (stars: number) => void;
	onReviewSubmit: (review: string) => void;
	avgStars?: number | null;
	reviewCount?: number;
};

const StarIcon: FC<{ fill: "full" | "half" | "empty" }> = ({ fill }) => {
	if (fill === "full")
		return <Star fill="#facc15" size={22} className="text-yellow-500" />;
	if (fill === "half")
		return (
			<span className="relative inline-block" style={{ width: 22, height: 22 }}>
				<Star
					fill="#facc15"
					size={22}
					className="text-yellow-500 absolute left-0 top-0"
					style={{ clipPath: "inset(0 50% 0 0)" }}
				/>
				<Star
					fill="none"
					size={22}
					className="text-gray-300 absolute left-0 top-0"
				/>
			</span>
		);
	return <Star fill="none" size={22} className="text-gray-300" />;
};

const StarWithHalves: FC<{
	value: number;
	rating: number | string | undefined;
	hoveredRating?: number | null;
	onRate: (v: number) => void;
	onHover: (v: number) => void;
	onLeave: () => void;
	disabled?: boolean;
}> = ({ value, rating, hoveredRating, onRate, onHover, onLeave, disabled }) => {
	const numRating =
		hoveredRating != null
			? hoveredRating
			: rating === undefined
				? undefined
				: typeof rating === "number"
					? rating
					: Number(rating);
	let fill: "full" | "half" | "empty" = "empty";
	if (numRating !== undefined && numRating >= value) fill = "full";
	else if (numRating !== undefined && numRating >= value - 0.5) fill = "half";
	return (
		<span className="relative inline-block w-6 h-6 align-middle">
			<StarIcon fill={fill} />
			{/* Left half (half-star) */}
			<button
				type="button"
				className="absolute left-0 top-0 w-1/2 h-full z-10 bg-transparent cursor-pointer"
				onClick={() => onRate(value - 0.5)}
				onMouseEnter={() => onHover(value - 0.5)}
				onMouseLeave={onLeave}
				disabled={disabled}
				aria-label={`Rate ${value - 0.5} stars`}
				style={{ outline: "none" }}
			/>
			{/* Right half (full-star) */}
			<button
				type="button"
				className="absolute right-0 top-0 w-1/2 h-full z-10 bg-transparent cursor-pointer"
				onClick={() => onRate(value)}
				onMouseEnter={() => onHover(value)}
				onMouseLeave={onLeave}
				disabled={disabled}
				aria-label={`Rate ${value} stars`}
				style={{ outline: "none" }}
			/>
		</span>
	);
};

const formatRating = (val?: number | string) => {
	if (val === undefined || val === null) return "Not rated";
	const num = typeof val === "number" ? val : Number(val);
	if (Number.isNaN(num)) return "Not rated";
	if (Number.isInteger(num)) return `${num}/5`;
	return `${num.toFixed(1)}/5`;
};

const MenuItemRatingCard: FC<MenuItemRatingCardProps> = ({
	menuItem,
	isTried: isTriedProp,
	rating: ratingProp,
	review: reviewProp,
	loading,
	onTriedChange,
	onRatingChange,
	onReviewSubmit,
	avgStars,
	reviewCount,
}) => {
	const [isTried, setIsTried] = useState(isTriedProp);
	const [rating, setRating] = useState<number | string | undefined>(ratingProp);
	const [review, setReview] = useState<string | undefined>(reviewProp);
	const [showReview, setShowReview] = useState(false);
	const [saved, setSaved] = useState(false);
	const [hoveredRating, setHoveredRating] = useState<number | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<ReviewForm>({
		defaultValues: { review: reviewProp || "" },
		mode: "onBlur",
	});

	useEffect(() => {
		setIsTried(isTriedProp);
	}, [isTriedProp]);

	useEffect(() => {
		setRating(ratingProp);
	}, [ratingProp]);

	useEffect(() => {
		setReview(reviewProp);
	}, [reviewProp]);

	const handleTriedChange = (tried: boolean) => {
		setIsTried(tried);
		onTriedChange(tried);
		if (!tried) {
			setRating(undefined);
			setReview("");
		}
	};

	const handleRatingChange = (stars: number) => {
		setRating(stars);
		onRatingChange(stars);
	};

	const handleReview = async (data: ReviewForm) => {
		onReviewSubmit(data.review ?? "");
		setReview(data.review ?? "");
		setSaved(true);
		setTimeout(() => setSaved(false), 1200);
		setShowReview(false);
		reset({ review: data.review });
	};

	const renderStars = () => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<StarWithHalves
					key={`star-${i}`}
					value={i}
					rating={rating}
					hoveredRating={hoveredRating}
					onRate={handleRatingChange}
					onHover={setHoveredRating}
					onLeave={() => setHoveredRating(null)}
					disabled={loading}
				/>,
			);
		}
		return stars;
	};

	return (
		<div className="border rounded-lg p-4 mb-4 bg-background shadow-sm flex flex-col gap-2">
			<div className="flex items-center justify-between gap-2">
				<div>
					<div className="font-semibold text-base">{menuItem.name}</div>
					{(menuItem.category || menuItem.subCategory) && (
						<div className="text-xs text-muted-foreground mt-0.5">
							{menuItem.category}
							{menuItem.subCategory ? ` • ${menuItem.subCategory}` : ""}
						</div>
					)}
					{menuItem.price && (
						<div className="text-xs text-gray-500">
							{formatPrice(menuItem.price)}
						</div>
					)}
					{menuItem.description && (
						<div className="text-xs text-muted-foreground mt-1">
							{menuItem.description}
						</div>
					)}
				</div>
				<div className="flex flex-col items-end gap-2">
					{/* Aggregate rating and detail link */}
					<div className="flex items-center gap-2 mb-1">
						{typeof avgStars === "number" && reviewCount && reviewCount > 0 ? (
							<>
								<span className="flex items-center">
									{[1, 2, 3, 4, 5].map((i) =>
										avgStars >= i ? (
											<Star
												key={i}
												size={16}
												fill="#facc15"
												className="text-yellow-500"
											/>
										) : avgStars >= i - 0.5 ? (
											<span
												key={i}
												className="relative inline-block w-2 h-4 align-middle"
											>
												<Star size={16} fill="none" className="text-gray-300" />
												<span
													className="absolute left-0 top-0 h-full"
													style={{
														width: "8px",
														overflow: "hidden",
														display: "inline-block",
													}}
												>
													<Star
														size={16}
														fill="#facc15"
														className="text-yellow-500"
													/>
												</span>
											</span>
										) : (
											<Star
												key={i}
												size={16}
												fill="none"
												className="text-gray-300"
											/>
										),
									)}
								</span>
								<span className="text-xs text-gray-500 ml-1">
									{avgStars.toFixed(1)}/5
								</span>
								<span className="text-xs text-gray-400 ml-1">
									({reviewCount})
								</span>
							</>
						) : (
							<span className="text-xs text-gray-400">No reviews</span>
						)}
						<Link
							href={`/menu-item/${menuItem.id}`}
							className="ml-2 text-blue-700 hover:text-blue-900"
							title="See all reviews"
						>
							<MessageCircle size={18} />
						</Link>
					</div>
					<div className="flex items-center gap-1">
						<Switch
							checked={isTried}
							onCheckedChange={handleTriedChange}
							disabled={loading}
						/>
						<span className="text-xs">Tried</span>
					</div>
					{saved && <span className="text-green-600 text-xs">Saved!</span>}
				</div>
			</div>
			{/* Only show stars and review if tried */}
			{isTried && (
				<>
					<div className="flex items-center gap-2 mt-2">
						{renderStars()}
						<span className="text-xs ml-2">{formatRating(rating)}</span>
					</div>
					<div className="flex items-center gap-2 mt-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => setShowReview((v) => !v)}
							disabled={loading}
						>
							{showReview ? "Cancel" : review ? "Edit Review" : "Add Review"}
						</Button>
						{review && !showReview && (
							<span className="text-xs text-muted-foreground truncate max-w-[180px]">
								{review}
							</span>
						)}
					</div>
					{showReview && (
						<form
							onSubmit={handleSubmit(handleReview)}
							className="mt-2 flex flex-col gap-2"
						>
							<Textarea
								{...register("review", { maxLength: 280 })}
								placeholder="Write a short review (optional)"
								rows={3}
								className="resize-none"
								disabled={isSubmitting || loading}
							/>
							{errors.review && (
								<span className="text-xs text-red-600">Max 280 characters</span>
							)}
							<div className="flex gap-2">
								<Button
									type="submit"
									size="sm"
									disabled={isSubmitting || loading}
								>
									Save Review
								</Button>
								<Button
									type="button"
									size="sm"
									variant="secondary"
									onClick={() => setShowReview(false)}
									disabled={isSubmitting || loading}
								>
									Cancel
								</Button>
							</div>
						</form>
					)}
				</>
			)}
		</div>
	);
};

export default MenuItemRatingCard;
