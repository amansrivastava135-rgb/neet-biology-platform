import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/payment/razorpay";
import { getPlanById } from "@/lib/pricing-config";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth";

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

    // Trial duplicate check
    if (planId === "trial") {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Login required" }, { status: 401 });
      }
      const { data: existing } = await supabase
        .from("users")
        .select("subscription_plan")
        .eq("email", user.email)
        .single();

      if (existing?.subscription_plan === "trial") {
        return NextResponse.json(
          { error: "You have already used the trial. Please upgrade to a full plan." },
          { status: 400 }
        );
      }
    }

    let finalPrice = plan.price;
    let discountAmount = 0;

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

    const amount = finalPrice * 100;
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
