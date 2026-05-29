import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ valid: false, message: "Unauthorized" }, { status: 401 });
    }

    const { code, planId } = await req.json();

    if (!code || !planId) {
      return NextResponse.json(
        { valid: false, message: "Code and plan are required" },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();

    const { data: promo, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", upperCode)
      .eq("is_active", true)
      .single();

    if (error || !promo) {
      return NextResponse.json({ valid: false, message: "Invalid promo code" });
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: "This promo code has expired" });
    }

    if (promo.used_count >= promo.max_uses) {
      return NextResponse.json({ valid: false, message: "This promo code has reached its usage limit" });
    }

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

    // JWT se email lo — body se nahi (spoofing prevent)
    const { data: existing } = await supabaseAdmin
      .from("promo_code_uses")
      .select("id")
      .eq("code", upperCode)
      .eq("user_email", user.email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        valid: false,
        message: "You have already used this promo code",
      });
    }

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
