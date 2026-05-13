import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";
import { getPlanById, calculateSubscriptionEnd } from "@/lib/pricing-config";

const VALID_TRACKS = ["class11", "class12", "dropper"] as const;

export async function POST(req: NextRequest) {
  try {
    // Admin auth check
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, action, planId = "premium", track } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (action === "grant") {
      const plan = getPlanById(planId);

      // Guided plan requires a valid track
      if (planId === "guided") {
        if (!track || !VALID_TRACKS.includes(track)) {
          return NextResponse.json(
            { error: "A valid track (class11 / class12 / dropper) is required for the Guided Plan" },
            { status: 400 }
          );
        }
      }

      const now = new Date();
      const expiry = calculateSubscriptionEnd(now, plan.durationDays);

      // Base user update
      const userUpdate: Record<string, any> = {
        is_paid: true,
        subscription_plan: plan.id,
        subscription_start: now.toISOString(),
        subscription_end: expiry.toISOString(),
      };

      // Write track to users table for guided plan
      if (planId === "guided" && track) {
        userUpdate.track = track;
      }

      // Fetch target user id first (needed for user_guided_state)
      const { data: targetUser, error: findError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (findError || !targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Update users table
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update(userUpdate)
        .eq("email", email);

      if (updateError) {
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      // For guided plan — upsert user_guided_state with chosen track
      if (planId === "guided" && track) {
        const { error: stateError } = await supabaseAdmin
          .from("user_guided_state")
          .upsert(
            {
              user_id: targetUser.id,
              track,
              progression_step: 0,
              chapters_completed: [],
              current_month_start_step: 0,
              streak_count: 0,
              last_active_date: null,
              last_mini_test_date: null,
              last_weekly_mock_date: null,
              last_monthly_mock_date: null,
            },
            { onConflict: "user_id" }
          );

        if (stateError) {
          // Non-fatal — log but don't fail the grant
          console.error("user_guided_state upsert error:", stateError.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: `${plan.id} granted (${plan.durationDays} days)${planId === "guided" ? ` · Track: ${track}` : ""}`,
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