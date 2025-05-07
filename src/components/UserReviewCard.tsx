import { Pencil, Star } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

type UserReviewCardProps = {
	itemName: string;
	stars: number;
	price?: string;
	description?: string;
	review?: string;
	date: Date;
	showEdit?: boolean;
	editHref?: string;
};

const UserReviewCard: FC<UserReviewCardProps> = ({
	itemName,
	stars,
	price,
	description,
	review,
	date,
	showEdit = false,
	editHref,
}) => {
	// Render stars with half-star support (one icon per star)
	const renderStars = () => {
		const starsArr = [];
		for (let i = 1; i <= 5; i++) {
			if (stars >= i) {
				// Full star
				starsArr.push(
					<Star
						key={i}
						size={16}
						fill="#facc15"
						className="text-yellow-500 inline"
					/>,
				);
			} else if (stars >= i - 0.5) {
				// Half star: empty star, then filled star in a half-width overlay
				starsArr.push(
					<span key={i} className="relative inline-block w-4 h-4 align-middle">
						<Star size={16} fill="none" className="text-gray-300" />
						<span
							className="absolute left-0 top-0 h-full"
							style={{
								width: "8px", // half of 16px
								overflow: "hidden",
								display: "inline-block",
							}}
						>
							<Star size={16} fill="#facc15" className="text-yellow-500" />
						</span>
					</span>,
				);
			} else {
				// Empty star
				starsArr.push(
					<Star
						key={i}
						size={16}
						fill="none"
						className="text-gray-300 inline"
					/>,
				);
			}
		}
		return starsArr;
	};

	return (
		<div className="border rounded p-3 bg-gray-50 relative">
			<div className="flex items-center justify-between">
				<span className="font-medium">{itemName}</span>
				<span className="flex items-center gap-1 text-yellow-500">
					{renderStars()}
					<span className="ml-1 text-xs text-gray-500">
						{Number(stars).toFixed(1)}/5
					</span>
				</span>
				{showEdit && editHref && (
					<Link
						href={editHref}
						className="ml-2 text-blue-700 hover:text-blue-900"
						title="Edit review"
					>
						<Pencil size={16} />
					</Link>
				)}
			</div>
			{price && <div className="text-xs text-gray-500">{price}</div>}
			{description && (
				<div className="text-xs text-gray-400">{description}</div>
			)}
			{review && <div className="mt-1 text-sm">"{review}"</div>}
			<div className="text-xs text-gray-400 mt-1">
				Rated {date.toLocaleDateString()}
			</div>
		</div>
	);
};

export default UserReviewCard;
