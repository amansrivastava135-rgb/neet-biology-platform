import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PRICING, getPlanById, calculateSubscriptionEnd } from "@/lib/pricing-config";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, action, planId = "premium" } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (action === "grant") {
      const plan = getPlanById(planId);
      const now = new Date();
      const expiry = calculateSubscriptionEnd(now, plan.durationDays);

      const { error } = await supabase
        .from("users")
        .update({
          is_paid: true,
          subscription_plan: plan.id,
          subscription_start: now.toISOString(),
          subscription_end: expiry.toISOString(),
        })
        .eq("email", email);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `${plan.id} granted (${plan.durationDays} days)`,
      });

    } else if (action === "revoke") {
      const { error } = await supabase
        .from("users")
        .update({
          is_paid: false,
          subscription_plan: "free",
          subscription_start: null,
          subscription_end: null,
        })
        .eq("email", email);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Premium revoked" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err) {
    console.error("Grant premium error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}