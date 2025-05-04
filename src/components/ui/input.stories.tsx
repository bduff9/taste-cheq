import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
	title: "ui/Input",
	component: Input,
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
	args: {
		placeholder: "Type here...",
	},
	render: (args) => <Input {...args} />,
};

export const PasswordWithToggle: Story = {
	render: () => {
		const [show, setShow] = useState(false);
		return (
			<div style={{ position: "relative", width: 300 }}>
				<Input type={show ? "text" : "password"} placeholder="Password" />
				<button
					type="button"
					style={{ position: "absolute", right: 8, top: 8, fontSize: 12 }}
					onClick={() => setShow((v) => !v)}
				>
					{show ? "Hide" : "Show"}
				</button>
			</div>
		);
	},
};
