import { fireEvent, render, screen } from "@testing-library/react";
import MenuItemRatingCard from "./MenuItemRatingCard";

describe("MenuItemRatingCard", () => {
	it("renders menu item and toggles tried", () => {
		const onTriedChange = jest.fn();
		render(
			<MenuItemRatingCard
				menuItem={{ id: "1", name: "Pizza" }}
				isTried={false}
				rating={undefined}
				review={""}
				onTriedChange={onTriedChange}
				onRatingChange={jest.fn()}
				onReviewSubmit={jest.fn()}
			/>,
		);
		expect(screen.getByText(/pizza/i)).toBeInTheDocument();
		const toggle = screen.getByText(/tried/i).previousSibling as HTMLElement;
		fireEvent.click(toggle);
		expect(onTriedChange).toHaveBeenCalledWith(true);
	});
});
