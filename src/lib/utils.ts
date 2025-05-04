import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
	const merged = twMerge(clsx(inputs));
	// Deduplicate, preserving order
	const deduped = Array.from(new Set(merged.split(/\s+/).filter(Boolean))).join(
		" ",
	);
	return deduped;
};
