import ProfileNav from "@/app/profile/ProfileNav";
import ScanFlow from "@/components/ScanFlow";
import Image from "next/image";

export default function ScanPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
			<ProfileNav />
			<main className="flex-1 flex flex-col items-center justify-center px-4">
				<div className="max-w-xl w-full bg-white rounded-lg shadow p-6 mt-8 mb-8 space-y-6">
					<h1 className="text-2xl font-bold mb-2">Scan a Menu</h1>
					<ScanFlow searchParams={searchParams} />
				</div>
			</main>
			<footer className="w-full py-8 bg-blue-900 text-white text-center mt-16">
				<div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
					<div className="flex items-center gap-2">
						<Image
							src="/logo.svg"
							alt="TasteCheq Logo"
							width={32}
							height={32}
							className="rounded"
						/>
						<span className="font-bold text-lg">TasteCheq</span>
					</div>
					<div className="flex gap-6 text-sm">
						<a href="/about" className="hover:underline">
							About
						</a>
						<a href="/contact" className="hover:underline">
							Contact
						</a>
						<a href="/privacy" className="hover:underline">
							Privacy
						</a>
						<a href="/profile" className="hover:underline">
							Profile
						</a>
					</div>
					<div className="text-xs text-blue-200">
						&copy; {new Date().getFullYear()} TasteCheq. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}
