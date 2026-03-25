import crypto from "crypto";
import { NextResponse } from "next/server";

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

  // Payment verified — process karo
  const payment = JSON.parse(body);
  console.log("Payment verified:", payment.event);

  return NextResponse.json({ status: "ok" });
}