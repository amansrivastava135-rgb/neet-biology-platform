import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_SECRET || "",
});

export function createOrder(amount: number, currency = "INR", receipt?: string) {
  // when keys are not configured we return a dummy order for local testing
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
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
  // if there is no secret configured, simply trust the request (dev mode)
  if (!process.env.RAZORPAY_SECRET) {
    return true;
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;
  const generated = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET || "")
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");
  return generated === razorpay_signature;
}
