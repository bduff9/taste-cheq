"use client";

import { getGeminiUsageCount } from "@/app/gemini-usage-action";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_OPTIONS, SUBCATEGORY_OPTIONS } from "@/lib/category-options";
import type React from "react";
import { type FC, useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

// Helper: Split OCR text into menu items using regex/heuristics
const splitMenuItems = (
	text: string,
): { name: string; price?: string; description?: string }[] => {
	const lines = text
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	const priceRegex = /\$?\d{1,3}(?:[.,]\d{2})?/;
	const items: { name: string; price?: string; description?: string }[] = [];
	let buffer: string[] = [];
	for (const line of lines) {
		if (priceRegex.test(line)) {
			if (buffer.length) {
				items.push({ name: buffer.join(" ") });
				buffer = [];
			}
			// Try to split name/price/desc
			const match = line.match(
				/^(.*?)(?:\s+[-:.]?\s*)?(\$?\d{1,3}(?:[.,]\d{2})?)\s*(.*)$/,
			);
			if (match) {
				const [, name, price, desc] = match;
				items.push({
					name: name.trim(),
					price: price.trim(),
					description: desc.trim() || undefined,
				});
			} else {
				items.push({ name: line });
			}
		} else {
			buffer.push(line);
		}
	}
	if (buffer.length) items.push({ name: buffer.join(" ") });
	return items.filter((item) => item.name.length > 0);
};

// Add OCR modes
type OcrMode = "free" | "tastecheq";

// Add TasteCheq API call helper
const runTasteCheqMenuParse = async (
	image: string,
): Promise<{ name: string; price?: string; description?: string }[]> => {
	// Only call the local API route, never TasteCheq directly from the client
	const res = await fetch("/api/gemini-menu", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ imageBase64: image }),
	});
	if (!res.ok) throw new Error("TasteCheq API failed");
	return await res.json();
};

type ScanMenuProps = {
	existingMenuItems: {
		id: string;
		name: string;
		price?: string;
		description?: string;
		category?: string;
		subCategory?: string;
	}[];
	onAdd: (
		itemsToAdd: { name: string; price?: string; description?: string }[],
		itemsToUpdate: {
			id: string;
			name: string;
			price?: string;
			description?: string;
		}[],
		setProgress?: (n: number) => void,
	) => void;
	onCancel: () => void;
	onBack?: () => void;
	onContinue?: () => void;
};

// Helper to get a stable key for menu items
const getMenuItemKey = (
	item: { name: string; price?: string; description?: string } & {
		id?: string;
	},
	idx: number,
) => {
	return typeof item === "object" && "id" in item && item.id
		? item.id
		: `${item.name}-${idx}`;
};

// Utility: Compress and resize image to stay under maxSizeMB
async function compressImage(
	file: File,
	maxSizeMB = 3.3,
	maxWidth = 1600,
	maxHeight = 1600,
	quality = 0.8,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new window.Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			let { width, height } = img;
			if (width > maxWidth || height > maxHeight) {
				const scale = Math.min(maxWidth / width, maxHeight / height);
				width = Math.round(width * scale);
				height = Math.round(height * scale);
			}
			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			ctx?.drawImage(img, 0, 0, width, height);

			function tryExport(q: number) {
				canvas.toBlob(
					(blob) => {
						if (!blob) return reject(new Error("Compression failed"));
						if (blob.size <= maxSizeMB * 1024 * 1024 || q < 0.5) {
							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result as string);
							reader.readAsDataURL(blob);
						} else {
							tryExport(q - 0.1);
						}
					},
					"image/jpeg",
					q,
				);
			}
			tryExport(quality);
		};
		img.onerror = () => reject(new Error("Image load failed"));
		img.src = url;
	});
}

// MenuActions block
const MenuActions: FC<{
	handleUploadClick: () => void;
}> = ({ handleUploadClick }) => (
	<div className="flex flex-wrap gap-2 mb-4">
		<Button onClick={handleUploadClick} variant="outline">
			Take Photo or Upload
		</Button>
	</div>
);

export const ScanMenu: FC<ScanMenuProps> = ({
	existingMenuItems,
	onAdd,
	onCancel,
	onBack,
	onContinue,
}) => {
	const [image, setImage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [ocrText, setOcrText] = useState<string | null>(null);
	const [progress, setProgress] = useState<number>(0);
	const [isLoading, setIsLoading] = useState(false);
	const [menuItems, setMenuItems] = useState<
		{
			name: string;
			price?: string;
			description?: string;
			category?: string;
			subCategory?: string;
		}[]
	>([]);
	const [ocrMode, setOcrMode] = useState<OcrMode>("free");
	const [tastecheqUses, setTastecheqUses] = useState<number>(0);
	const [tastecheqLimit, setTastecheqLimit] = useState<number>(5);
	const [isPaid, setIsPaid] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Duplicate detection state
	const [duplicates, setDuplicates] = useState<number[]>([]);
	const [newItems, setNewItems] = useState<number[]>([]);
	const [updateCandidates, setUpdateCandidates] = useState<number[]>([]);
	const [itemsToUpdate, setItemsToUpdate] = useState<
		{
			id: string;
			name: string;
			price?: string;
			description?: string;
		}[]
	>([]);
	const [isUploading, setIsUploading] = useState(false);

	// Add a ref for the review section
	const reviewRef = useRef<HTMLDivElement>(null);
	const [highlightReview, setHighlightReview] = useState(false);

	// Fetch usage count and paid status on mount
	useEffect(() => {
		async function fetchUsage() {
			try {
				const usage = await getGeminiUsageCount();
				setTastecheqUses(usage.count);
				setTastecheqLimit(usage.limit);
				setIsPaid(usage.isPaid);
			} catch {}
		}
		fetchUsage();
	}, []);

	// Duplicate detection after scan or edit
	useEffect(() => {
		const dups: number[] = [];
		const news: number[] = [];
		const updates: number[] = [];
		const toUpdate: typeof itemsToUpdate = [];
		menuItems.forEach((item, idx) => {
			const match = existingMenuItems.find(
				(e) =>
					e.name.trim().toLowerCase() ===
					(item.name ?? "").trim().toLowerCase(),
			);
			if (match) {
				dups.push(idx);
				// If new item has more data (e.g. description), mark as update candidate
				if (
					(!match.description && item.description) ||
					(!match.price && item.price) ||
					(!match.category && item.category) ||
					(!match.subCategory && item.subCategory)
				) {
					updates.push(idx);
					toUpdate.push({ ...item, id: match.id });
				}
			} else {
				news.push(idx);
			}
		});
		setDuplicates(dups);
		setNewItems(news);
		setUpdateCandidates(updates);
		setItemsToUpdate(toUpdate);
	}, [menuItems, existingMenuItems]);

	// After OCR completes and menuItems are set, scroll to review section and highlight
	useEffect(() => {
		if (menuItems.length > 0 && reviewRef.current) {
			reviewRef.current.scrollIntoView({ behavior: "smooth" });
			setHighlightReview(true);
			const timeout = setTimeout(() => setHighlightReview(false), 1200);
			return () => clearTimeout(timeout);
		}
	}, [menuItems.length]);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setError("Please select an image file.");
			return;
		}
		try {
			const compressedBase64 = await compressImage(file, 3.3, 1600, 1600, 0.8);
			setImage(compressedBase64);
			setError(null);
			setOcrText(null);
			setMenuItems([]);
		} catch (err) {
			setError("Failed to process image. Try a different one.");
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleRunOcr = async () => {
		if (!image) return;
		setIsLoading(true);
		setProgress(0);
		setOcrText(null);
		setError(null);
		setMenuItems([]);
		try {
			if (ocrMode === "free") {
				const { data } = await Tesseract.recognize(image, "eng", {
					logger: (m) => {
						if (m.status === "recognizing text" && m.progress) {
							setProgress(Math.round(m.progress * 100));
						}
					},
				});
				setOcrText(data.text.trim());
				setMenuItems(splitMenuItems(data.text));
			} else if (ocrMode === "tastecheq") {
				if (!isPaid && tastecheqUses >= tastecheqLimit) {
					setError(
						`TasteCheq free-tier limit reached (${tastecheqLimit} per month). Upgrade for unlimited.`,
					);
					setIsLoading(false);
					return;
				}
				try {
					const items = await runTasteCheqMenuParse(image);
					setOcrText("[TasteCheq AI parsed menu]");
					setMenuItems(items);
					// Refresh usage count after successful call
					const usage = await getGeminiUsageCount();
					setTastecheqUses(usage.count);
					setTastecheqLimit(usage.limit);
					setIsPaid(usage.isPaid);
				} catch (err) {
					setError("TasteCheq AI parsing failed.");
				}
				setIsLoading(false);
			}
		} catch (err) {
			setError("OCR failed. Please try another image.");
			setIsLoading(false);
		}
	};

	// Manual correction UI handlers
	const handleEditItem = (
		idx: number,
		field: "name" | "price" | "description" | "category" | "subCategory",
		value: string,
	) => {
		setMenuItems((items) =>
			items.map((item, i) =>
				i === idx
					? {
							...item,
							[field]: value,
							...(field === "category" ? { subCategory: "" } : {}),
						}
					: item,
			),
		);
	};
	const handleDeleteItem = (idx: number) => {
		setMenuItems((items) => items.filter((_, i) => i !== idx));
	};
	const handleAddItem = () => {
		setMenuItems((items) => [...items, { name: "" }]);
	};
	const handleSplitItem = (idx: number, splitIdx: number) => {
		setMenuItems((items) => {
			const item = items[idx];
			const name = item.name;
			const before = name.slice(0, splitIdx).trim();
			const after = name.slice(splitIdx).trim();
			if (!before || !after) return items;
			const newItems = [...items];
			newItems.splice(idx, 1, { ...item, name: before }, { name: after });
			return newItems;
		});
	};
	const handleMergeWithNext = (idx: number) => {
		setMenuItems((items) => {
			if (idx >= items.length - 1) return items;
			const merged = {
				name: `${items[idx].name} ${items[idx + 1].name}`,
				price: items[idx].price || items[idx + 1].price,
				description: items[idx].description || items[idx + 1].description,
			};
			const newItems = [...items];
			newItems.splice(idx, 2, merged);
			return newItems;
		});
	};

	// Add items to DB
	const handleAdd = async () => {
		setIsUploading(true);
		setError(null);
		try {
			const toAdd = newItems.map((idx) => menuItems[idx]);
			const toUpdate = itemsToUpdate;
			await onAdd(toAdd, toUpdate, setProgress);
		} catch (err) {
			setError("Failed to add or update items");
		} finally {
			setIsUploading(false);
		}
	};

	const canContinue = menuItems.length > 0;

	return (
		<div className="max-w-md mx-auto p-4 space-y-4">
			<h1 className="text-2xl font-bold mb-2">Scan a Menu</h1>
			<p className="text-muted-foreground mb-4">
				Upload a photo or take a picture of a menu to digitize it, or manually
				add items below.
			</p>
			{/* OCR Mode Selector */}
			<div className="flex gap-2 items-center mb-2">
				<Label htmlFor="ocrMode" className="font-medium">
					Mode:
				</Label>
				<Select
					value={ocrMode}
					onValueChange={(value) => setOcrMode(value as OcrMode)}
				>
					<SelectTrigger className="w-40 max-w-full truncate">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="max-w-[200px]">
						<SelectItem value="free">OCR</SelectItem>
						<SelectItem value="tastecheq">
							<span className="block sm:hidden truncate">AI</span>
							<span className="hidden sm:inline truncate">
								TasteCheq AI{" "}
								{isPaid ? "(unlimited)" : `(${tastecheqLimit}/mo free)`}
							</span>
						</SelectItem>
					</SelectContent>
				</Select>
				{ocrMode === "tastecheq" && !isPaid && (
					<span className="text-xs text-muted-foreground truncate max-w-[100px]">
						{tastecheqLimit - tastecheqUses} TasteCheq uses left this month
					</span>
				)}
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				capture="environment"
				className="hidden"
				onChange={handleFileChange}
			/>
			{/* Top actions */}
			{menuItems.length > 2 ? (
				<MenuActions handleUploadClick={handleUploadClick} />
			) : (
				<div className="flex gap-2 mb-4">
					<Button onClick={handleUploadClick} variant="outline">
						{image ? "Change Image" : "Take Photo or Upload"}
					</Button>
				</div>
			)}
			{error && <p className="text-destructive text-sm">{error}</p>}
			{image && (
				<div className="mt-4 space-y-4">
					<img
						src={image}
						alt="Menu preview"
						className="rounded shadow max-h-64 mx-auto"
					/>
					<Button
						onClick={handleRunOcr}
						disabled={isLoading}
						className="w-full mt-2"
					>
						{isLoading ? "Processing..." : "Scan Menu"}
					</Button>
					{isLoading && (
						<div className="w-full bg-muted rounded h-2 mt-2">
							<div
								className="bg-primary h-2 rounded"
								style={{ width: `${progress}%` }}
							/>
						</div>
					)}
					{ocrText && (
						<div className="mt-4">
							<h2 className="font-semibold mb-2">Extracted Text</h2>
							<pre className="bg-muted p-2 rounded text-sm whitespace-pre-wrap">
								{ocrText}
							</pre>
						</div>
					)}
					{menuItems.length > 0 && (
						<div
							ref={reviewRef}
							className={
								highlightReview
									? "transition-colors duration-500 bg-yellow-100 rounded p-2"
									: ""
							}
						>
							<div className="mb-2 text-sm text-blue-700 font-medium">
								Review the scanned menu items below. Edit, split, or merge as
								needed, then click Continue.
							</div>
							<ul className="space-y-2">
								{menuItems.map((item, idx) => (
									<li
										key={getMenuItemKey(item, idx)}
										className="flex flex-col gap-1 border rounded p-2 bg-background"
									>
										<div className="flex gap-2 items-center">
											<div className="flex-1">
												<input
													className="border rounded px-2 py-1 w-full"
													value={item.name}
													onChange={(e) =>
														handleEditItem(idx, "name", e.target.value)
													}
													placeholder="Item name"
												/>
												{(item.category || item.subCategory) && (
													<div className="text-xs text-muted-foreground mt-0.5">
														{item.category}
														{item.subCategory ? ` • ${item.subCategory}` : ""}
													</div>
												)}
											</div>
											<input
												className="border rounded px-2 py-1 w-20"
												value={item.price || ""}
												onChange={(e) =>
													handleEditItem(idx, "price", e.target.value)
												}
												placeholder="$"
											/>
											<Button
												size="icon"
												variant="ghost"
												onClick={() => handleDeleteItem(idx)}
												title="Delete"
											>
												🗑️
											</Button>
										</div>
										<Textarea
											className="border rounded px-2 py-1 w-full mt-1 text-sm"
											value={item.description || ""}
											onChange={(e) =>
												handleEditItem(idx, "description", e.target.value)
											}
											placeholder="Description (optional)"
											rows={1}
										/>
										{/* Category dropdown */}
										<div className="mt-1">
											<label
												htmlFor={`category-select-${idx}`}
												className="block text-xs font-medium mb-1"
											>
												Category
											</label>
											<Select
												value={item.category || ""}
												onValueChange={(cat: string) =>
													handleEditItem(idx, "category", cat)
												}
											>
												<SelectTrigger
													id={`category-select-${idx}`}
													className="w-full"
												>
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
												<SelectContent>
													{CATEGORY_OPTIONS.map((cat: string) => (
														<SelectItem key={cat} value={cat}>
															{cat}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										{/* Sub-category dropdown */}
										{item.category && SUBCATEGORY_OPTIONS[item.category] && (
											<div className="mt-1">
												<label
													htmlFor={`subcategory-select-${idx}`}
													className="block text-xs font-medium mb-1"
												>
													Sub-Category
												</label>
												<Select
													value={item.subCategory || ""}
													onValueChange={(sub: string) =>
														handleEditItem(idx, "subCategory", sub)
													}
												>
													<SelectTrigger
														id={`subcategory-select-${idx}`}
														className="w-full"
													>
														<SelectValue placeholder="Select sub-category" />
													</SelectTrigger>
													<SelectContent>
														{SUBCATEGORY_OPTIONS[item.category].map(
															(sub: string) => (
																<SelectItem key={sub} value={sub}>
																	{sub}
																</SelectItem>
															),
														)}
													</SelectContent>
												</Select>
											</div>
										)}
										<div className="flex gap-2 mt-1">
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleMergeWithNext(idx)}
												disabled={idx === menuItems.length - 1}
											>
												Merge with next
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => {
													const splitIdx = item.name.indexOf(
														" ",
														Math.floor(item.name.length / 2),
													);
													if (splitIdx > 0) handleSplitItem(idx, splitIdx);
												}}
												disabled={item.name.split(" ").length < 2}
											>
												Split
											</Button>
											{/* Duplicate/Update/New indicators */}
											{duplicates.includes(idx) && (
												<span className="text-xs text-yellow-600 ml-2">
													Duplicate
												</span>
											)}
											{newItems.includes(idx) && (
												<span className="text-xs text-green-600 ml-2">New</span>
											)}
											{updateCandidates.includes(idx) && (
												<span className="text-xs text-blue-600 ml-2">
													Will update
												</span>
											)}
										</div>
									</li>
								))}
							</ul>
							<div className="flex gap-2 mt-4">
								<Button
									onClick={onCancel}
									variant="secondary"
									disabled={isUploading}
								>
									Cancel
								</Button>
								<Button
									onClick={handleAdd}
									disabled={
										isUploading ||
										(newItems.length === 0 && updateCandidates.length === 0)
									}
									title={
										newItems.length === 0 && updateCandidates.length === 0
											? "No new or updatable items to add."
											: undefined
									}
								>
									{isUploading
										? "Processing..."
										: `Add ${newItems.length + updateCandidates.length} Items`}
								</Button>
							</div>
							{error && <div className="text-red-600 mt-2">{error}</div>}
							{isUploading && (
								<div className="w-full bg-muted rounded h-2 mt-4">
									<div
										className="bg-primary h-2 rounded"
										style={{ width: `${progress}%` }}
									/>
								</div>
							)}
						</div>
					)}
				</div>
			)}
			{menuItems.length > 2 && (
				<MenuActions handleUploadClick={handleUploadClick} />
			)}
		</div>
	);
};

