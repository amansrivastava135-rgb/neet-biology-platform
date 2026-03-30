import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/payment/razorpay";
import { PRICING, calculateSubscriptionEnd } from "@/lib/pricing-config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = body;

    // Signature verify karo
    const valid = verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    const now = new Date();
    const subscriptionEnd = calculateSubscriptionEnd(now);

    // Supabase update karo
    if (email) {
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
        console.error("Supabase update error:", error);
      }
    }

    const userUpdate = {
      subscriptionPlan: PRICING.premium.id,
      subscriptionStart: now.toISOString(),
      subscriptionEnd: subscriptionEnd.toISOString(),
      subscription: "active",
      plan: PRICING.premium.id,
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