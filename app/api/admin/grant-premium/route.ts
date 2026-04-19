import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";
import { getPlanById, calculateSubscriptionEnd } from "@/lib/pricing-config";

export async function POST(req: NextRequest) {
  try {
    // Admin auth check
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, action, planId = "premium" } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (action === "grant") {
      const plan = getPlanById(planId);
      const now = new Date();
      const expiry = calculateSubscriptionEnd(now, plan.durationDays);

      const { error } = await supabaseAdmin
        .from("users")
        .update({
          is_paid: true,
          subscription_plan: plan.id,
          subscription_start: now.toISOString(),
          subscription_end: expiry.toISOString(),
        })
        .eq("email", email);

      if (error) {
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `${plan.id} granted (${plan.durationDays} days)`,
      });
    }

    if (action === "revoke") {
      const { error } = await supabaseAdmin
        .from("users")
        .update({
          is_paid: false,
          subscription_plan: "free",
          subscription_start: null,
          subscription_end: null,
        })
        .eq("email", email);

      if (error) {
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