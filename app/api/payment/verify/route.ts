import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/payment/razorpay";
import { PRICING, calculateSubscriptionEnd } from "@/lib/pricing-config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const valid = verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    // Use centralized pricing configuration for subscription
    const now = new Date();
    const subscriptionEnd = calculateSubscriptionEnd(now);

    const userUpdate = {
      subscriptionPlan: PRICING.premium.id,
      subscriptionStart: now.toISOString(),
      subscriptionEnd: subscriptionEnd.toISOString(),
      subscription: "active",
      plan: PRICING.premium.id,
      subscription_start: now.toISOString(),
      subscription_end: subscriptionEnd.toISOString(),
      expiryDate: subscriptionEnd.toISOString(), // legacy field
      isPaid: true,
    };
    return NextResponse.json({ success: true, user: userUpdate });
  } catch (err: any) {
    console.error("verify error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
