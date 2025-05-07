import { render, screen } from "@testing-library/react";
import ScanFlowClient from "./ScanFlowClient";

describe("ScanFlowClient", () => {
	it("renders step 1 and navigates to step 2", () => {
		render(
			<ScanFlowClient
				step={1}
				setStep={jest.fn()}
				restaurant={null}
				setRestaurant={jest.fn()}
				restaurantId={null}
				setRestaurantId={jest.fn()}
				menuItems={[]}
				setMenuItems={jest.fn()}
				triedItems={[]}
				setTriedItems={jest.fn()}
				ratings={[]}
				setRatings={jest.fn()}
			/>,
		);
		expect(screen.getByText(/select a restaurant/i)).toBeInTheDocument();
	});
});
