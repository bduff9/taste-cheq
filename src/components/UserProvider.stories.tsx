import type { User } from "@/lib/db-types";
import type { Meta, StoryObj } from "@storybook/react";
import { UserProvider, useUser } from "./UserProvider";

const meta: Meta<typeof UserProvider> = {
	title: "App/UserProvider",
	component: UserProvider,
};
export default meta;

type Story = StoryObj<typeof UserProvider>;

const mockUser = {
	id: "1",
	email: "demo@example.com",
	name: "Demo User",
	avatarUrl: null,
	homeCity: "Demo City",
	homeState: "CA",
	isAdmin: false,
	passwordHash: "",
	created: "2024-01-01T00:00:00.000Z",
	createdById: null,
	updated: null,
	updatedById: null,
	deleted: null,
	deletedById: null,
} as unknown as User;

const ShowUser = () => {
	const { user } = useUser();
	return <pre>{JSON.stringify(user, null, 2)}</pre>;
};

export const WithUser: Story = {
	render: () => (
		<UserProvider user={mockUser}>
			<ShowUser />
		</UserProvider>
	),
};

export const NoUser: Story = {
	render: () => (
		<UserProvider user={null}>
			<ShowUser />
		</UserProvider>
	),
};
