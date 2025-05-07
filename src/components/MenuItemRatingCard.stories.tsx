import type { Meta, StoryObj } from "@storybook/react";
import MenuItemRatingCard from "./MenuItemRatingCard";

const meta: Meta<typeof MenuItemRatingCard> = {
	title: "Components/MenuItemRatingCard",
	component: MenuItemRatingCard,
};
export default meta;

type Story = StoryObj<typeof MenuItemRatingCard>;

export const Default: Story = {
	args: {
		menuItem: {
			id: "1",
			name: "Sample Menu Item",
			price: "$12.99",
			description: "A delicious sample item.",
		},
		isTried: false,
		rating: undefined,
		review: "",
		onTriedChange: () => {},
		onRatingChange: () => {},
		onReviewSubmit: () => {},
		avgStars: 4.5,
		reviewCount: 12,
	},
};
