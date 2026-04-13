import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/payment/razorpay";
import { getPlanById, calculateSubscriptionEnd } from "@/lib/pricing-config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      planId = "premium",
    } = body;

    const valid = verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    const plan = getPlanById(planId);
    const now = new Date();
    const subscriptionEnd = calculateSubscriptionEnd(now, plan.durationDays);

    if (email) {
      const { error } = await supabase
        .from("users")
        .update({
          is_paid: true,
          subscription_plan: plan.id,
          subscription_start: now.toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
        })
        .eq("email", email);

      if (error) console.error("Supabase update error:", error);
    }

    const userUpdate = {
      subscriptionPlan: plan.id,
      subscriptionStart: now.toISOString(),
      subscriptionEnd: subscriptionEnd.toISOString(),
      subscription: "active",
      plan: plan.id,
      subscription_start: now.toISOString(),
      subscription_end: subscriptionEnd.toISOString(),
      expiryDate: subscriptionEnd.toISOString(),
      isPaid: true,
    };

    return NextResponse.json({ success: true, user: userUpdate });
  } catch (err: any) {
    console.error("verify error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}