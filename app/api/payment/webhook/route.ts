import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPlanById, calculateSubscriptionEnd } from "@/lib/pricing-config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expectedSig = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (expectedSig !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payment = JSON.parse(body);
  console.log("Webhook event:", payment.event);

  if (payment.event === "payment.captured") {
    try {
      const paymentData = payment.payload?.payment?.entity;
      const email = paymentData?.email;
      // Webhook me plan detect karo description se, default premium
      const planId = paymentData?.description?.includes("trial")
  ? "trial"
  : paymentData?.description?.includes("monthly")
  ? "monthly"
  : paymentData?.description?.includes("sixMonth")
  ? "sixMonth"
  : "premium";
      const plan = getPlanById(planId);

      if (email) {
        const now = new Date();
        const subscriptionEnd = calculateSubscriptionEnd(now, plan.durationDays);

        const { error } = await supabase
          .from("users")
          .update({
            is_paid: true,
            subscription_plan: plan.id,
            subscription_start: now.toISOString(),
            subscription_end: subscriptionEnd.toISOString(),
          })
          .eq("email", email);

        if (error) {
          console.error("Webhook Supabase update error:", error);
        } else {
          console.log(`✅ ${plan.id} activated via webhook for: ${email}`);
        }
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  return NextResponse.json({ status: "ok" });
}