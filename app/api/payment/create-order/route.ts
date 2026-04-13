import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/payment/razorpay";
import { PRICING, getPlanById } from "@/lib/pricing-config";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({}));
    const planId = data.planId || "premium";
    const plan = getPlanById(planId);
    const amount = plan.price * 100; // paise
    const order = await createOrder(
      amount,
      plan.currency,
      `neet_${planId}_${Date.now()}`
    );
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("create-order error", err);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}