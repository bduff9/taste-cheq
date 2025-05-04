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
	render: (args) => <Button {...args} />,
};

export const Outline: Story = {
	args: {
		children: "Outline Button",
		variant: "outline",
	},
	render: (args) => <Button {...args} />,
};

export const Secondary: Story = {
	args: {
		children: "Secondary Button",
		variant: "secondary",
	},
	render: (args) => <Button {...args} />,
};

export const Destructive: Story = {
	args: {
		children: "Destructive Button",
		variant: "destructive",
	},
	render: (args) => <Button {...args} />,
};

export const Ghost: Story = {
	args: {
		children: "Ghost Button",
		variant: "ghost",
	},
	render: (args) => <Button {...args} />,
};

export const Link: Story = {
	args: {
		children: "Link Button",
		variant: "link",
	},
	render: (args) => <Button {...args} />,
};

export const Large: Story = {
	args: {
		children: "Large Button",
		size: "lg",
	},
	render: (args) => <Button {...args} />,
};

export const Small: Story = {
	args: {
		children: "Small Button",
		size: "sm",
	},
	render: (args) => <Button {...args} />,
};
