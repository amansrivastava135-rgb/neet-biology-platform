import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/payment/razorpay";
import { getPlanById } from "@/lib/pricing-config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({}));
    const planId = data.planId || "premium";
    const promoCode = data.promoCode || null;
    const plan = getPlanById(planId);

    let finalPrice = plan.price;
    let discountAmount = 0;

    // Apply promo discount if code is provided
    if (promoCode) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (promo && promo.used_count < promo.max_uses) {
        if (promo.type === "percent") {
          discountAmount = Math.round((plan.price * promo.discount_percent) / 100);
        } else {
          discountAmount = promo.discount_amount;
        }
        finalPrice = Math.max(plan.price - discountAmount, 1);
      }
    }

    const amount = finalPrice * 100; // convert to paise
    const order = await createOrder(
      amount,
      plan.currency,
      `neet_${planId}_${Date.now()}`
    );

    return NextResponse.json({
      ...order,
      originalPrice: plan.price,
      finalPrice,
      discountAmount,
    });
  } catch (err: any) {
    console.error("create-order error", err);
    return NextResponse.json({ error: "Could not create order" }, { status: 500 });
  }
}