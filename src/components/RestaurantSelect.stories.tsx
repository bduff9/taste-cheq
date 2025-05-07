import type { Meta, StoryObj } from "@storybook/react";
import RestaurantSelect from "./RestaurantSelect";

const meta: Meta<typeof RestaurantSelect> = {
	title: "Components/RestaurantSelect",
	component: RestaurantSelect,
};
export default meta;

type Story = StoryObj<typeof RestaurantSelect>;

export const Default: Story = {
	args: {
		onSelect: (r) => alert(JSON.stringify(r)),
		googleMapsApiKey: "FAKE_KEY",
	},
};
