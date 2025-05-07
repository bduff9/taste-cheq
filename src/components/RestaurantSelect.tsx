"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APIProvider, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";

type Restaurant = {
	id?: string;
	name: string;
	address: string;
	location?: { lat: number; lng: number };
};

type RestaurantSelectProps = {
	onSelect: (r: Restaurant) => void;
	googleMapsApiKey: string;
};

const PlaceAutocomplete: React.FC<{
	onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}> = ({ onPlaceSelect }) => {
	const [placeAutocomplete, setPlaceAutocomplete] =
		useState<google.maps.places.Autocomplete | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const places = useMapsLibrary("places");

	useEffect(() => {
		if (!places || !inputRef.current) return;
		const options = { fields: ["geometry", "name", "formatted_address"] };
		setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
	}, [places]);

	useEffect(() => {
		if (!placeAutocomplete) return;
		placeAutocomplete.addListener("place_changed", () => {
			onPlaceSelect(placeAutocomplete.getPlace());
		});
	}, [onPlaceSelect, placeAutocomplete]);

	return (
		<Input
			ref={inputRef}
			className="input w-full"
			placeholder="Search for a restaurant (Google Maps Autocomplete)"
			type="text"
		/>
	);
};

export default function RestaurantSelect({
	onSelect,
	googleMapsApiKey,
}: RestaurantSelectProps) {
	const [mode, setMode] = useState<"search" | "add">("search");
	const [addForm, setAddForm] = useState({ name: "", address: "" });
	const [loadError, setLoadError] = useState<string | null>(null);

	const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
		if (!place || !place.geometry || !place.formatted_address || !place.name)
			return;
		const lat = place.geometry.location?.lat();
		const lng = place.geometry.location?.lng();
		if (typeof lat !== "number" || typeof lng !== "number") return;
		onSelect({
			name: place.name,
			address: place.formatted_address,
			location: { lat, lng },
		});
	};

	return (
		<APIProvider apiKey={googleMapsApiKey} libraries={["places"]}>
			<div className="space-y-6">
				<h2 className="text-xl font-bold mb-4">Select or Add a Restaurant</h2>
				{mode === "search" && (
					<div className="space-y-4">
						<PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
						<Button
							className="btn w-full"
							type="button"
							onClick={() => setMode("add")}
						>
							Add New Restaurant
						</Button>
					</div>
				)}
				{mode === "add" && (
					<form
						className="space-y-4"
						onSubmit={(e) => {
							e.preventDefault();
							if (!addForm.name || !addForm.address) return;
							onSelect({ name: addForm.name, address: addForm.address });
						}}
					>
						<Input
							className="input w-full"
							placeholder="Restaurant Name"
							value={addForm.name}
							onChange={(e) =>
								setAddForm((f) => ({ ...f, name: e.target.value }))
							}
							required
						/>
						<Input
							className="input w-full"
							placeholder="Address (Google Maps Autocomplete)"
							value={addForm.address}
							onChange={(e) =>
								setAddForm((f) => ({ ...f, address: e.target.value }))
							}
							required
						/>
						{/* TODO: Google Maps location picker for manual add */}
						<div className="flex gap-2">
							<Button className="btn" type="submit">
								Add Restaurant
							</Button>
							<Button
								className="btn btn-secondary"
								type="button"
								onClick={() => setMode("search")}
							>
								Back to Search
							</Button>
						</div>
					</form>
				)}
			</div>
		</APIProvider>
	);
}
