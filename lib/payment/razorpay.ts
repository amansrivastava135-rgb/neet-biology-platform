import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_SECRET || "",
});

export function createOrder(amount: number, currency = "INR", receipt?: string) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    // Production mein error throw karo
    if (process.env.NODE_ENV === "production") {
      throw new Error("Razorpay keys not configured!");
    }
    // Sirf development mein dummy order
    return Promise.resolve({ id: `test_order_${Date.now()}`, amount, currency });
  }

  return razorpay.orders.create({
    amount,
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    payment_capture: 1 as unknown as boolean,
  });
}

export function verifySignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const secret = process.env.RAZORPAY_SECRET;

  // Production mein secret hona zaroori hai
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Razorpay secret not configured!");
    }
    // Sirf development mein bypass
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