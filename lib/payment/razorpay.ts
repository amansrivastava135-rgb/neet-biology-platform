import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_SECRET || "",
});

export async function createOrder(
  amount: number,
  currency = "INR",
  receipt?: string
) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Razorpay keys not configured!");
    }
    return { id: `test_order_${Date.now()}`, amount, currency };
  }

  const order = await razorpay.orders.create({
    amount,           // paise mein — 2900 = ₹29
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
  });

  return order;
}

export function verifySignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const secret = process.env.RAZORPAY_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Razorpay secret not configured!");
    }
    console.warn("⚠️ Razorpay secret missing — bypassing in dev mode");
    return true;
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;
  const generated = crypto
    .createHmac("sha256", secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  return generated === razorpay_signature;
}
