import { getUserFromSessionCookie } from "@/lib/auth";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: "2025-04-30.basil",
});

const PRICE_IDS: Record<string, string | undefined> = {
	monthly: process.env.STRIPE_PRICE_MONTHLY,
	yearly: process.env.STRIPE_PRICE_YEARLY,
	lifetime: process.env.STRIPE_PRICE_LIFETIME,
};

export async function POST(req: NextRequest) {
	const sessionId = req.cookies.get("session")?.value;
	const user = await getUserFromSessionCookie(sessionId);
	if (!user) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	const { plan } = await req.json();
	if (!plan || !PRICE_IDS[plan]) {
		return new Response(JSON.stringify({ error: "Invalid plan" }), {
			status: 400,
		});
	}

	const priceId = PRICE_IDS[plan];
	if (!priceId) {
		return new Response(
			JSON.stringify({ error: "Price ID not set for plan" }),
			{ status: 500 },
		);
	}

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		mode: plan === "lifetime" ? "payment" : "subscription",
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		customer_email: user.email,
		success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile?upgrade=success`,
		cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile?upgrade=cancel`,
		metadata: {
			userId: user.id,
			plan,
		},
	});

	return new Response(JSON.stringify({ url: session.url }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
}
