import { Button } from "@/components/ui/button";
import Link from "next/link";

const ContactPage = () => (
	<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
		<div className="max-w-xl w-full text-center">
			<h1 className="text-3xl font-bold text-blue-800 mb-4">Contact Us</h1>
			<p className="text-lg text-gray-700 mb-4">
				Have questions, feedback, or need support? We'd love to hear from you!
			</p>
			<p className="text-md text-gray-600 mb-8">
				Please email us at{" "}
				<a
					href="mailto:support@tastecheq.com"
					className="text-blue-700 underline"
				>
					support@tastecheq.com
				</a>{" "}
				and we'll get back to you as soon as possible.
			</p>
			<Button asChild>
				<Link href="/">Back to Home</Link>
			</Button>
		</div>
	</div>
);

export default ContactPage;
