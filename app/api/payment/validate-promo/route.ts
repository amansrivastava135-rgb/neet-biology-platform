import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { code, planId, email } = await req.json();

    if (!code || !planId) {
      return NextResponse.json({ valid: false, message: "Code and plan are required" }, { status: 400 });
    }

    const upperCode = code.toUpperCase().trim();

    // Fetch promo code
    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", upperCode)
      .eq("is_active", true)
      .single();

    if (error || !promo) {
      return NextResponse.json({ valid: false, message: "Invalid promo code" });
    }

    // Expiry check
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: "This promo code has expired" });
    }

    // Max uses check
    if (promo.used_count >= promo.max_uses) {
      return NextResponse.json({ valid: false, message: "This promo code has reached its usage limit" });
    }

    // Plan applicability check — handle both array and string formats
    const applicablePlans: string[] = Array.isArray(promo.applicable_plans)
      ? promo.applicable_plans
      : typeof promo.applicable_plans === "string"
      ? JSON.parse(promo.applicable_plans)
      : [];

    if (!applicablePlans.includes(planId)) {
      return NextResponse.json({
        valid: false,
        message: "This code is not applicable for the selected plan",
      });
    }

    // Check if same user already used this code
    if (email) {
      const { data: existing } = await supabase
        .from("promo_code_uses")
        .select("id")
        .eq("code", upperCode)
        .eq("user_email", email)
        .maybeSingle(); // use maybeSingle instead of single to avoid error when not found

      if (existing) {
        return NextResponse.json({
          valid: false,
          message: "You have already used this promo code",
        });
      }
    }

    // Calculate discount
    const { getPlanById } = await import("@/lib/pricing-config");
    const plan = getPlanById(planId);
    let discountAmount = 0;

    if (promo.type === "percent") {
      discountAmount = Math.round((plan.price * promo.discount_percent) / 100);
    } else if (promo.type === "flat") {
      discountAmount = Math.min(promo.discount_amount, plan.price - 1);
    }

    const finalPrice = Math.max(plan.price - discountAmount, 1);

    return NextResponse.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      discountAmount,
      discountPercent: promo.discount_percent,
      originalPrice: plan.price,
      finalPrice,
      message:
        promo.type === "percent"
          ? `${promo.discount_percent}% off applied!`
          : `₹${discountAmount} off applied!`,
    });
  } catch (err) {
    console.error("validate-promo error:", err);
    return NextResponse.json({ valid: false, message: "Server error" }, { status: 500 });
  }
}