import type { Meta, StoryObj } from "@storybook/react";
import HomePage from "./HomePage";

const meta: Meta<typeof HomePage> = {
	title: "App/HomePage",
	component: HomePage,
	parameters: {
		docs: {
			description: {
				component:
					"This story renders the HomePage component. For full functionality, wrap with UserProvider in your app.",
			},
		},
	},
};
export default meta;

type Story = StoryObj<typeof HomePage>;

export const Default: Story = {
	render: () => <HomePage />,
};
