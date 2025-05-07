"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const plans = [
	{
		id: "monthly",
		label: "$5.99/month",
		desc: "Billed monthly, cancel anytime.",
	},
	{ id: "yearly", label: "$49.99/year", desc: "Save 30% vs monthly." },
	{ id: "lifetime", label: "$99 lifetime", desc: "Early adopter special!" },
];

export default function UpgradeModal() {
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleUpgrade = async (plan: string) => {
		setLoading(plan);
		setError(null);
		try {
			const res = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ plan }),
			});
			if (!res.ok) throw new Error("Failed to start checkout");
			const { url } = await res.json();
			window.location.href = url;
		} catch (err) {
			setError("Failed to start checkout. Please try again.");
		} finally {
			setLoading(null);
		}
	};

	return (
		<>
			<Button onClick={() => setShowModal(true)} className="w-full" size="lg">
				Upgrade to Pro
			</Button>
			{showModal && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
						<button
							type="button"
							className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
							onClick={() => setShowModal(false)}
							aria-label="Close"
						>
							×
						</button>
						<h2 className="text-xl font-bold mb-4">Upgrade to Pro</h2>
						<ul className="space-y-3 mb-4">
							{plans.map((plan) => (
								<li key={plan.id} className="border rounded p-3 flex flex-col">
									<span className="font-semibold">{plan.label}</span>
									<span className="text-sm text-gray-500 mb-2">
										{plan.desc}
									</span>
									<Button
										onClick={() => handleUpgrade(plan.id)}
										disabled={loading === plan.id}
										className="w-full"
									>
										{loading === plan.id
											? "Redirecting..."
											: `Choose ${plan.label}`}
									</Button>
								</li>
							))}
						</ul>
						{error && <div className="text-red-600 text-sm mb-2">{error}</div>}
						<div className="text-xs text-gray-400 mt-2">
							Secure payment via Stripe. You'll be redirected to complete your
							purchase.
						</div>
					</div>
				</div>
			)}
		</>
	);
}
