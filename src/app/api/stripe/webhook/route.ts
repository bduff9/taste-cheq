import { db } from "@/lib/db";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
if (!STRIPE_WEBHOOK_SECRET || typeof STRIPE_WEBHOOK_SECRET !== "string")
	throw new Error("STRIPE_WEBHOOK_SECRET is not set");
const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
	const sig = req.headers.get("stripe-signature");
	console.log("sig", sig);
	if (!sig) {
		return new Response("Missing Stripe signature", { status: 400 });
	}
	const buf = Buffer.from(await req.arrayBuffer());
	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(
			buf,
			sig as string,
			STRIPE_WEBHOOK_SECRET,
		);
	} catch (err) {
		console.log("err", err);
		return new Response(`Webhook Error: ${(err as Error).message}`, {
			status: 400,
		});
	}

	// Handle event types
	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;
		console.log(JSON.stringify(session, null, 2));
		const userId = session.metadata?.userId;
		const plan = session.metadata?.plan;
		if (!userId || !plan)
			return new Response("Missing userId or plan", { status: 400 });
		// For subscriptions, get subscription id and expiration
		let expires: Date | null = null;
		let stripeId: string | null = null;
		const type = plan;
		let status = "active";
		if (session.mode === "subscription" && session.subscription) {
			const sub = (await stripe.subscriptions.retrieve(
				session.subscription as string,
			)) as Stripe.Subscription;
			stripeId = sub.id;
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const currentPeriodEnd: number | undefined = (sub as any)
				.current_period_end;
			if (typeof currentPeriodEnd === "number") {
				expires = new Date(currentPeriodEnd * 1000);
			}
			status = sub.status;
		} else if (session.mode === "payment") {
			stripeId = session.payment_intent as string;
			expires = null; // Lifetime
		}
		// Upsert Subscription
		await db
			.insertInto("Subscription")
			.values({
				id: stripeId || userId, // fallback
				userId,
				type,
				stripeId: stripeId || null,
				status,
				started: new Date(),
				expires,
				created: new Date(),
				updated: new Date(),
			})
			.onConflict((oc) =>
				oc.column("userId").doUpdateSet({
					type,
					stripeId: stripeId || null,
					status,
					started: new Date(),
					expires,
					updated: new Date(),
				}),
			)
			.execute();
	}
	// Optionally handle subscription.updated, .deleted, etc.
	if (
		event.type === "customer.subscription.updated" ||
		event.type === "customer.subscription.deleted"
	) {
		const sub = event.data.object as Stripe.Subscription;
		// Find user by stripeId
		const subRow = await db
			.selectFrom("Subscription")
			.selectAll()
			.where("stripeId", "=", sub.id)
			.executeTakeFirst();
		if (subRow) {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const currentPeriodEnd: number | undefined = (sub as any)
				.current_period_end;
			await db
				.updateTable("Subscription")
				.set({
					status: sub.status,
					expires:
						typeof currentPeriodEnd === "number"
							? new Date(currentPeriodEnd * 1000)
							: null,
					updated: new Date(),
				})
				.where("id", "=", subRow.id)
				.execute();
		}
	}
	return new Response("ok", { status: 200 });
}
