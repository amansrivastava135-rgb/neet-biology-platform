import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/payment/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    const valid = verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    // in a real app we would update the user record in database
    const now = new Date();
    const subscriptionEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const userUpdate = {
      subscription: "active",
      plan: "NEET Test Series",
      subscription_start: now.toISOString(),
      subscription_end: subscriptionEnd,
      expiryDate: subscriptionEnd, // legacy field
    };
    return NextResponse.json({ success: true, user: userUpdate });
  } catch (err: any) {
    console.error("verify error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
