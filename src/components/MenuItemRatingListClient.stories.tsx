import type { Meta, StoryObj } from "@storybook/react";
import MenuItemRatingListClient from "./MenuItemRatingListClient";

const meta: Meta<typeof MenuItemRatingListClient> = {
	title: "Components/MenuItemRatingListClient",
	component: MenuItemRatingListClient,
};
export default meta;

type Story = StoryObj<typeof MenuItemRatingListClient>;

export const Default: Story = {
	args: {
		menuItems: [
			{
				id: "1",
				name: "Pizza",
				price: "$10.99",
				description: "Cheesy pizza",
			},
			{
				id: "2",
				name: "Burger",
				price: "$8.99",
				description: "Juicy burger",
			},
		],
		userTriedItems: [{ menuItemId: "1" }],
		userRatings: [{ menuItemId: "1", stars: 4.5, text: "Great!" }],
	},
};
