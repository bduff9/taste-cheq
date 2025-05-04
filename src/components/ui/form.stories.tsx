import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { Button } from "./button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./form";
import { Input } from "./input";

const meta: Meta<typeof Form> = {
	title: "ui/Form",
	component: Form,
};
export default meta;

type Story = StoryObj<typeof Form>;

export const SimpleForm: Story = {
	render: () => {
		const form = useForm<{ email: string }>({ defaultValues: { email: "" } });
		return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(() => {})} style={{ width: 300 }}>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="Email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" style={{ marginTop: 16 }}>
						Submit
					</Button>
				</form>
			</Form>
		);
	},
};
