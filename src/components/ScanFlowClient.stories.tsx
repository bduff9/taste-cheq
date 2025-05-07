import type { Meta, StoryObj } from "@storybook/react";
import ScanFlowClient from "./ScanFlowClient";

const meta: Meta<typeof ScanFlowClient> = {
	title: "Components/ScanFlowClient",
	component: ScanFlowClient,
};
export default meta;

type Story = StoryObj<typeof ScanFlowClient>;

export const Default: Story = {
	args: {},
};
