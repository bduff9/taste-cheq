"use client";
import { useSearchParams } from "next/navigation";
import { type FC, useEffect, useState } from "react";

const Alert: FC<{
	variant?: "success" | "destructive";
	className?: string;
	children: React.ReactNode;
}> = ({ variant = "success", className = "", children }) => (
	<div
		className={`border rounded p-3 mb-4 ${variant === "success" ? "border-green-400 bg-green-50 text-green-800" : "border-red-400 bg-red-50 text-red-800"} ${className}`}
	>
		{children}
	</div>
);

const AlertTitle: FC<{ children: React.ReactNode }> = ({ children }) => (
	<div className="font-bold mb-1">{children}</div>
);

const AlertDescription: FC<{ children: React.ReactNode }> = ({ children }) => (
	<div>{children}</div>
);

const UpgradeAlert: FC = () => {
	const searchParams = useSearchParams();
	const [show, setShow] = useState(true);
	const upgrade = searchParams.get("upgrade");
	useEffect(() => {
		setShow(true);
	}, []);
	if (!upgrade || !show) return null;
	let title = "";
	let description = "";
	let variant: "success" | "destructive" = "success";
	if (upgrade === "success") {
		title = "Upgrade successful!";
		description =
			"Thank you for upgrading to TasteCheq Pro. Enjoy unlimited access!";
		variant = "success";
	} else if (upgrade === "cancel") {
		title = "Upgrade canceled";
		description =
			"You canceled the upgrade. You can upgrade anytime from your profile.";
		variant = "destructive";
	} else {
		return null;
	}
	return (
		<Alert variant={variant} className="mb-4 relative">
			<AlertTitle>{title}</AlertTitle>
			<AlertDescription>{description}</AlertDescription>
			<button
				type="button"
				className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
				onClick={() => setShow(false)}
				aria-label="Dismiss"
			>
				×
			</button>
		</Alert>
	);
};

export default UpgradeAlert;
