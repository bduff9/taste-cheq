"use client";
import { addMenuItemAction } from "@/app/menu-items-add-action";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type FC, useEffect, useRef, useState } from "react";
import { ScanMenu } from "./ScanMenu";

type MenuItem = {
	id: string;
	name: string;
	price?: string;
	description?: string;
};

type Restaurant = {
	id?: string;
	name: string;
	address: string;
	location?: { lat: number; lng: number };
};

const MenuReview: FC<{
	restaurant: Restaurant;
	onContinue: () => void;
	onBack: () => void;
}> = ({ restaurant, onContinue, onBack }) => {
	const [items, setItems] = useState<MenuItem[]>([]);
	const [editItem, setEditItem] = useState<MenuItem | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [uploadOpen, setUploadOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const restaurantId = useRef<string | undefined>(undefined);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [scanModalOpen, setScanModalOpen] = useState(false);
	const [scannedItems, setScannedItems] = useState<
		{ name: string; price?: string; description?: string }[]
	>([]);
	const [existingMenuItems, setExistingMenuItems] = useState<MenuItem[]>([]);

	// Fetch menu items for this restaurant
	useEffect(() => {
		if (!restaurant.id) return;
		setLoading(true);
		fetch(`/api/menu-items?restaurantId=${restaurant.id}`)
			.then((res) => res.json())
			.then((data) => {
				setItems(data);
				setExistingMenuItems(data);
				setLoading(false);
			})
			.catch(() => {
				setError("Failed to load menu items");
				setLoading(false);
			});
	}, [restaurant.id]);

	const handleEdit = (item: MenuItem) => {
		setEditItem(item);
		setModalOpen(true);
	};
	const handleSave = async () => {
		if (!editItem) return;
		setLoading(true);
		setError(null);
		try {
			if (editItem.id && items.find((i) => i.id === editItem.id)) {
				// Update (still via API for now)
				const res = await fetch("/api/menu-items", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(editItem),
				});
				if (!res.ok) throw new Error();
				const updated = await res.json();
				setItems((prev) =>
					prev.map((i) => (i.id === updated.id ? updated : i)),
				);
			} else {
				// Add via server action
				if (!restaurant.id) {
					setError("Missing restaurant ID");
					setLoading(false);
					return;
				}
				const result = await addMenuItemAction({
					restaurantId: restaurant.id,
					name: editItem.name,
					price: editItem.price,
					description: editItem.description,
				});
				if (!result.success || !result.item) {
					setError(result.error || "Failed to add item");
					setLoading(false);
					return;
				}
				setItems((prev) => [...prev, mapDbMenuItemToUi(result.item)]);
			}
			setModalOpen(false);
		} catch {
			setError("Failed to save item");
		} finally {
			setLoading(false);
		}
	};
	const handleDelete = async (id: string) => {
		setPendingDeleteId(id);
		setDeleteConfirmOpen(true);
	};
	const confirmDelete = async () => {
		if (!pendingDeleteId) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/menu-items", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: pendingDeleteId }),
			});
			if (!res.ok) throw new Error();
			setItems((prev) => prev.filter((i) => i.id !== pendingDeleteId));
			setDeleteConfirmOpen(false);
			setPendingDeleteId(null);
		} catch {
			setError("Failed to delete item");
			setDeleteConfirmOpen(false);
			setPendingDeleteId(null);
		} finally {
			setLoading(false);
		}
	};
	const handleAdd = () => {
		setEditItem({ id: "", name: "", price: "", description: "" });
		setModalOpen(true);
	};

	// Open scan modal
	const handleUpload = () => {
		setScannedItems([]);
		setScanModalOpen(true);
	};

	// Add scanned items to DB after user confirms
	const handleAddScannedItems = async (
		itemsToAdd: { name: string; price?: string; description?: string }[],
		itemsToUpdate: {
			id: string;
			name: string;
			price?: string;
			description?: string;
		}[],
		setProgress?: (n: number) => void,
	) => {
		setLoading(true);
		setError(null);
		if (setProgress) setProgress(0);
		try {
			let done = 0;
			const total = itemsToAdd.length + itemsToUpdate.length;
			// Add new items
			for (const item of itemsToAdd) {
				if (!restaurant.id) {
					continue;
				}

				await addMenuItemAction({
					restaurantId: restaurant.id,
					name: item.name,
					price: item.price ?? null,
					description: item.description ?? "",
				});
				done++;
				if (setProgress) setProgress(Math.round((done / total) * 100));
			}
			// Update updatable items
			for (const item of itemsToUpdate) {
				await fetch("/api/menu-items", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(item),
				});
				done++;
				if (setProgress) setProgress(Math.round((done / total) * 100));
			}
			// Refresh menu items list
			const res = await fetch(`/api/menu-items?restaurantId=${restaurant.id}`);
			const data = await res.json();
			setItems(data);
			setExistingMenuItems(data);
			setScanModalOpen(false);
			setScannedItems([]);
		} catch {
			setError("Failed to upload scanned items");
		} finally {
			setLoading(false);
			if (setProgress) setProgress(0);
		}
	};

	// On items change, check for duplicates (by name, case-insensitive)
	useEffect(() => {
		async function checkDuplicates() {
			if (!items.length) return;
			// Get restaurantId from parent context (hack: look for window.__restaurantId)
			if (!restaurantId.current && typeof window !== "undefined") {
				// @ts-ignore
				restaurantId.current = window.__restaurantId;
			}
			if (!restaurantId.current) return;
			// Fetch all menu items for this restaurant
			const res = await fetch(
				`/api/menu-items?restaurantId=${restaurantId.current}`,
			);
			if (!res.ok) return;
			const existing = await res.json();
			const dups: number[] = [];
			const news: number[] = [];
			const updates: number[] = [];
			items.forEach((item, idx) => {
				const match = existing.find(
					(e: MenuItem) =>
						e.name.trim().toLowerCase() === item.name.trim().toLowerCase(),
				);
				if (match) {
					dups.push(idx);
					// If new item has more data (e.g. description), mark as update candidate
					if (
						(!match.description && item.description) ||
						(!match.price && item.price)
					) {
						updates.push(idx);
					}
				} else {
					news.push(idx);
				}
			});
			setError(null);
			setItems((prev) =>
				prev.map((item, idx) =>
					dups.includes(idx) || news.includes(idx) || updates.includes(idx)
						? {
								...item,
								isDuplicate: dups.includes(idx),
								isNew: news.includes(idx),
								isUpdateCandidate: updates.includes(idx),
							}
						: item,
				),
			);
		}
		if (items.length) checkDuplicates();
	}, [items]);

	// Place ActionButtons and showTopActions here, after all handlers
	const canContinue = items.length > 0;
	const ActionButtons = (
		<div className="flex flex-wrap gap-2 mb-6">
			<Button onClick={handleUpload}>Upload Menu</Button>
			<Button variant="secondary" onClick={handleAdd}>
				Manually Add Item
			</Button>
			<Button onClick={onBack} variant="secondary">
				Back
			</Button>
			<Button onClick={onContinue} disabled={!canContinue}>
				Continue
			</Button>
		</div>
	);
	const showTopActions = items.length > 2;

	return (
		<div>
			<h2 className="text-xl font-bold mb-4">
				Menu Items for {restaurant.name}
			</h2>
			{showTopActions && ActionButtons}
			{loading && <div className="mb-2 text-blue-600">Loading...</div>}
			{error && <div className="mb-2 text-red-600">{error}</div>}
			<div className="space-y-2 mb-4">
				{items.map((item) => (
					<div
						key={item.id}
						className="flex items-center gap-2 border rounded p-2"
					>
						<div className="flex-1">
							<div className="font-semibold">{item.name}</div>
							<div className="text-sm text-gray-500">{item.price}</div>
							<div className="text-xs text-gray-400">{item.description}</div>
						</div>
						<Button
							size="sm"
							variant="outline"
							onClick={() => handleEdit(item)}
						>
							Edit
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => handleDelete(item.id)}
						>
							Delete
						</Button>
					</div>
				))}
			</div>
			{ActionButtons}
			{/* Edit/Add Modal */}
			<Dialog open={modalOpen} onOpenChange={setModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editItem?.id && items.find((i) => i.id === editItem.id)
								? "Edit Item"
								: "Add Item"}
						</DialogTitle>
					</DialogHeader>
					<form
						className="space-y-3"
						onSubmit={(e) => {
							e.preventDefault();
							handleSave();
						}}
					>
						<Input
							placeholder="Name"
							value={editItem?.name || ""}
							onChange={(e) =>
								setEditItem((i) => (i ? { ...i, name: e.target.value } : i))
							}
							required
						/>
						<Input
							placeholder="Price"
							value={editItem?.price || ""}
							onChange={(e) =>
								setEditItem((i) => (i ? { ...i, price: e.target.value } : i))
							}
						/>
						<Input
							placeholder="Description"
							value={editItem?.description || ""}
							onChange={(e) =>
								setEditItem((i) =>
									i ? { ...i, description: e.target.value } : i,
								)
							}
						/>
						<div className="flex gap-2 mt-4">
							<Button
								type="button"
								variant="secondary"
								onClick={() => setModalOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Save</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
			{/* Upload/Scan Modal */}
			<Dialog open={scanModalOpen} onOpenChange={setScanModalOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Upload Menu (Scan, Review, and Add)</DialogTitle>
					</DialogHeader>
					<ScanMenu
						existingMenuItems={existingMenuItems}
						onAdd={handleAddScannedItems}
						onCancel={() => setScanModalOpen(false)}
					/>
				</DialogContent>
			</Dialog>
			<Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Delete</DialogTitle>
					</DialogHeader>
					<div>
						Are you sure you want to delete this menu item? This cannot be
						undone.
					</div>
					<div className="flex gap-2 mt-4">
						<Button
							variant="secondary"
							onClick={() => setDeleteConfirmOpen(false)}
						>
							Cancel
						</Button>
						<Button variant="destructive" onClick={confirmDelete}>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

const mapDbMenuItemToUi = (item: unknown): MenuItem => {
	const i = item as {
		id: string | number;
		name: string;
		price?: string | number;
		description?: string;
	};
	return {
		id: String(i.id),
		name: i.name,
		price: i.price ? String(i.price) : "",
		description: i.description ?? "",
	};
};

export default MenuReview;
