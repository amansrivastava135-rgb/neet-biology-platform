import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/payment/razorpay";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({ }));
    // one-time price 499 INR (amount in paise)
    const amount = 49900;
    const order = await createOrder(amount, "INR", `neet_test_series_${Date.now()}`);
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("create-order error", err);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}
