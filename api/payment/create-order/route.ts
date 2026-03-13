import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/payment/razorpay";
import { PRICING } from "@/lib/pricing-config";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({ }));
    const amount = PRICING.premium.price * 100; // paise
    const order = await createOrder(amount, PRICING.premium.currency, `neet_test_series_${Date.now()}`);
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("create-order error", err);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
