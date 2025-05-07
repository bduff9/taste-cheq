import type { Meta, StoryObj } from "@storybook/react";
import UserReviewCard from "./UserReviewCard";

const meta: Meta<typeof UserReviewCard> = {
	title: "Components/UserReviewCard",
	component: UserReviewCard,
};
export default meta;

type Story = StoryObj<typeof UserReviewCard>;

export const Default: Story = {
	args: {
		itemName: "Sample Item",
		stars: 4.5,
		review: "This was delicious!",
		date: new Date("2024-06-01"),
		showEdit: true,
		editHref: "/scan?restaurantId=1&step=3",
	},
};
