import { Button } from "@/components/ui/button";
import Link from "next/link";

const AboutPage = () => (
	<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
		<div className="max-w-xl w-full text-center">
			<h1 className="text-3xl font-bold text-blue-800 mb-4">About TasteCheq</h1>
			<p className="text-lg text-gray-700 mb-8">
				TasteCheq is a mobile-first PWA for scanning, recording, and rating menu
				items at restaurants, bars, and more. Our mission is to help you
				remember and share your taste adventures, discover new favorites, and
				make every dining experience memorable.
			</p>
			<Button asChild>
				<Link href="/">Back to Home</Link>
			</Button>
		</div>
	</div>
);

export default AboutPage;
