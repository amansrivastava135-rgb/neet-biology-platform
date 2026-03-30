import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PRICING, calculateSubscriptionEnd } from "@/lib/pricing-config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSig !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payment = JSON.parse(body);
  console.log("Webhook event:", payment.event);

  if (payment.event === "payment.captured") {
    try {
      const paymentData = payment.payload?.payment?.entity;
      const email = paymentData?.email;

      if (email) {
        const now = new Date();
        const subscriptionEnd = calculateSubscriptionEnd(now);

        const { error } = await supabase
          .from("users")
          .update({
            is_paid: true,
            subscription_plan: PRICING.premium.id,
            subscription_start: now.toISOString(),
            subscription_end: subscriptionEnd.toISOString(),
          })
          .eq("email", email);

        if (error) {
          console.error("Webhook Supabase update error:", error);
        } else {
          console.log(`✅ Premium activated via webhook for: ${email}`);
        }
      } else {
        console.warn("⚠️ No email found in webhook payload");
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  return NextResponse.json({ status: "ok" });
}