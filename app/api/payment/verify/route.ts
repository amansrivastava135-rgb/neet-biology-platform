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
      promoCode = null,
      discountAmount = 0,
    } = body;

    // Verify payment signature
    const valid = verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    const plan = getPlanById(planId);
    const now = new Date();
    const subscriptionEnd = calculateSubscriptionEnd(now, plan.durationDays);

    // Update user subscription in database
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

      // Record promo code usage
      if (promoCode) {
        const upperCode = promoCode.toUpperCase().trim();

        // Increment usage count
        await supabase.rpc("increment_promo_usage", { promo_code: upperCode });

        // Log usage
        await supabase.from("promo_code_uses").insert({
          code: upperCode,
          user_email: email,
          plan_id: plan.id,
          discount_applied: discountAmount,
        });
      }
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