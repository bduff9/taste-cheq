import type { Meta, StoryObj } from "@storybook/react";
import { ScanMenu } from "./ScanMenu";

const meta: Meta<typeof ScanMenu> = {
	title: "Components/ScanMenu",
	component: ScanMenu,
};
export default meta;

type Story = StoryObj<typeof ScanMenu>;

export const Default: Story = {
	args: {
		existingMenuItems: [],
		onAdd: () => {},
		onCancel: () => {},
	},
};
