"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FC } from "react";

const MenuItemDetailBackButton: FC = () => {
	const router = useRouter();
	return (
		<Button
			variant="ghost"
			size="sm"
			className="mb-4 flex items-center gap-1"
			onClick={() => router.back()}
		>
			<ArrowLeft size={16} /> Back
		</Button>
	);
};

export default MenuItemDetailBackButton;
