import { fireEvent, render, screen } from "@testing-library/react";
import MenuItemRatingList from "./MenuItemRatingList";

describe("MenuItemRatingList", () => {
	it("renders multiple menu items and toggles tried", () => {
		const onTriedChange = jest.fn();
		render(
			<MenuItemRatingList
				menuItems={[
					{ id: "1", name: "Pizza" },
					{ id: "2", name: "Burger" },
				]}
				userTriedItems={[]}
				userRatings={[]}
				onTriedChange={onTriedChange}
				onRatingChange={jest.fn()}
				onReviewSubmit={jest.fn()}
			/>,
		);
		expect(screen.getByText(/pizza/i)).toBeInTheDocument();
		expect(screen.getByText(/burger/i)).toBeInTheDocument();
		const toggle = screen.getAllByText(/tried/i)[0]
			.previousSibling as HTMLElement;
		fireEvent.click(toggle);
		expect(onTriedChange).toHaveBeenCalledWith("1", true);
	});
});
