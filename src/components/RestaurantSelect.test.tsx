import { fireEvent, render, screen } from "@testing-library/react";
import RestaurantSelect from "./RestaurantSelect";

describe("RestaurantSelect", () => {
	it("renders search input and add button", () => {
		render(
			<RestaurantSelect onSelect={jest.fn()} googleMapsApiKey="FAKE_KEY" />,
		);
		expect(
			screen.getByPlaceholderText(/search for a restaurant/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add new restaurant/i }),
		).toBeInTheDocument();
	});

	it("shows add form and calls onSelect on submit", () => {
		const onSelect = jest.fn();
		render(
			<RestaurantSelect onSelect={onSelect} googleMapsApiKey="FAKE_KEY" />,
		);
		fireEvent.click(
			screen.getByRole("button", { name: /add new restaurant/i }),
		);
		fireEvent.change(screen.getByPlaceholderText(/restaurant name/i), {
			target: { value: "Test Place" },
		});
		fireEvent.change(screen.getByPlaceholderText(/address/i), {
			target: { value: "123 Main St" },
		});
		fireEvent.click(screen.getByRole("button", { name: /add restaurant/i }));
		expect(onSelect).toHaveBeenCalledWith({
			name: "Test Place",
			address: "123 Main St",
		});
	});
});
