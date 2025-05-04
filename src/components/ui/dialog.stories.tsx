import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";

const meta: Meta<typeof Dialog> = {
	title: "ui/Dialog",
	component: Dialog,
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const BasicDialog: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button>Open Dialog</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Dialog Title</DialogTitle>
					</DialogHeader>
					<p>This is a dialog content area.</p>
					<DialogClose asChild>
						<Button variant="secondary">Close</Button>
					</DialogClose>
				</DialogContent>
			</Dialog>
		);
	},
};
