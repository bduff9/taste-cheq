export function formatPrice(price?: string | number | null) {
	if (price == null || price === "") return "";
	const num =
		typeof price === "string" ? Number(price.replace(/[^0-9.]/g, "")) : price;
	if (Number.isNaN(num)) return "";
	return num.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
