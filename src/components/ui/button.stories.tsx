import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
	title: "ui/Button",
	component: Button,
	tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
	args: {
		children: "Default Button",
	},
};

export const Outline: Story = {
	args: {
		children: "Outline Button",
		variant: "outline",
	},
};

export const Secondary: Story = {
	args: {
		children: "Secondary Button",
		variant: "secondary",
	},
};

export const Destructive: Story = {
	args: {
		children: "Destructive Button",
		variant: "destructive",
	},
};

export const Ghost: Story = {
	args: {
		children: "Ghost Button",
		variant: "ghost",
	},
};

export const Link: Story = {
	args: {
		children: "Link Button",
		variant: "link",
	},
};

export const Large: Story = {
	args: {
		children: "Large Button",
		size: "lg",
	},
};

export const Small: Story = {
	args: {
		children: "Small Button",
		size: "sm",
	},
};
