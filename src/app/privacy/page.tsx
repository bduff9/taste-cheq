import { Button } from "@/components/ui/button";
import Link from "next/link";

const PrivacyPage = () => (
	<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
		<div className="max-w-xl w-full text-center">
			<h1 className="text-3xl font-bold text-blue-800 mb-4">Privacy Policy</h1>
			<p className="text-lg text-gray-700 mb-8">
				Your privacy is important to us. TasteCheq only collects the information
				necessary to provide our service. We do not sell your data. For
				questions or concerns, please contact us at{" "}
				<a
					href="mailto:support@tastecheq.com"
					className="text-blue-700 underline"
				>
					support@tastecheq.com
				</a>
				.
			</p>
			<Button asChild>
				<Link href="/">Back to Home</Link>
			</Button>
		</div>
	</div>
);

export default PrivacyPage;
