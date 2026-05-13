import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

const VALID_TRACKS = ["class11", "class12", "dropper"] as const;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only guided plan users should hit this route
    if (user.subscriptionPlan !== "guided") {
      return NextResponse.json({ error: "Guided plan required" }, { status: 403 });
    }

    const { track } = await request.json();

    if (!VALID_TRACKS.includes(track)) {
      return NextResponse.json({ error: "Invalid track" }, { status: 400 });
    }

    // Save track to users table
    const { error: userError } = await supabaseAdmin
      .from("users")
      .update({ track })
      .eq("id", user.id);

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Also initialise user_guided_state with the chosen track
    // (upsert — safe to call even if row already exists)
    const { error: stateError } = await supabaseAdmin
      .from("user_guided_state")
      .upsert(
        {
          user_id: user.id,
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
      return NextResponse.json({ error: stateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, track });
  } catch (err) {
    console.error("set-track error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}