import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
	it("merges class names", () => {
		expect(cn("a", "b")).toBe("a b");
	});

	it("deduplicates class names", () => {
		expect(cn("a", "b", "a")).toBe("a b");
	});

	it("handles conditional classes", () => {
		expect(cn("a", false && "b", "c")).toBe("a c");
	});

	it("handles arrays of classes", () => {
		expect(cn(["a", "b"], "c")).toBe("a b c");
	});

	it("handles undefined/null/false", () => {
		expect(cn("a", undefined, null, false, "b")).toBe("a b");
	});
});
