import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/payment/razorpay";
import { getPlanById, calculateSubscriptionEnd } from "@/lib/pricing-config";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser, signToken, getTokenCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Auth check — JWT se user lo, body ke email pe bharosa nahi
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId = "premium",
      promoCode = null,
      discountAmount = 0,
    } = body;

    const valid = verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    const plan = getPlanById(planId);
    const now = new Date();
    const subscriptionEnd = calculateSubscriptionEnd(now, plan.durationDays);

    const { error } = await supabaseAdmin
      .from("users")
      .update({
        is_paid: true,
        subscription_plan: plan.id,
        subscription_start: now.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
      })
      .eq("email", user.email); // body email nahi, JWT email

    if (error) console.error("Supabase update error:", error);

    if (promoCode) {
      const upperCode = promoCode.toUpperCase().trim();
      await supabaseAdmin.rpc("increment_promo_usage", { promo_code: upperCode });
      await supabaseAdmin.from("promo_code_uses").insert({
        code: upperCode,
        user_email: user.email,
        plan_id: plan.id,
        discount_applied: discountAmount,
      });
    }

    // Cookie mein updated token set karo — isPaid: true reflect ho
    const newToken = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      isPaid: true,
      subscriptionPlan: plan.id,
      subscriptionEnd: subscriptionEnd.toISOString(),
    });

    const userForClient = {
      isPaid: true,
      subscriptionPlan: plan.id,
      subscriptionStart: now.toISOString(),
      subscriptionEnd: subscriptionEnd.toISOString(),
      subscription: "active",
    };

    const response = NextResponse.json({ success: true, user: userForClient });
    const opts = getTokenCookieOptions();
    response.cookies.set(opts.name, newToken, opts);

    return response;
  } catch (err) {
    console.error("verify error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}