import type { Meta, StoryObj } from "@storybook/react";
import MenuReview from "./MenuReview";

const meta: Meta<typeof MenuReview> = {
	title: "Components/MenuReview",
	component: MenuReview,
};
export default meta;

type Story = StoryObj<typeof MenuReview>;

export const Default: Story = {
	args: {
		restaurant: {
			id: "1",
			name: "Sample Restaurant",
			address: "123 Main St",
		},
		onContinue: () => {},
		onBack: () => {},
	},
};
