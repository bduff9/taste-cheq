import type { Meta, StoryObj } from "@storybook/react";
import MenuItemRatingList from "./MenuItemRatingList";

const meta: Meta<typeof MenuItemRatingList> = {
	title: "Components/MenuItemRatingList",
	component: MenuItemRatingList,
};
export default meta;

type Story = StoryObj<typeof MenuItemRatingList>;

export const Default: Story = {
	args: {
		menuItems: [
			{
				id: "1",
				name: "Pizza",
				price: "$10.99",
				description: "Cheesy pizza",
				avgStars: 4.2,
				reviewCount: 8,
			},
			{
				id: "2",
				name: "Burger",
				price: "$8.99",
				description: "Juicy burger",
				avgStars: 3.8,
				reviewCount: 5,
			},
		],
		userTriedItems: [{ menuItemId: "1" }],
		userRatings: [{ menuItemId: "1", stars: 4.5, text: "Great!" }],
		onTriedChange: () => {},
		onRatingChange: () => {},
		onReviewSubmit: () => {},
	},
};
