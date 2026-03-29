import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, action } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    if (action === "grant") {
      const now = new Date();
      const expiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from("users")
        .update({
          is_paid: true,
          subscription_plan: "premium",
          subscription_start: now.toISOString(),
          subscription_end: expiry.toISOString(),
        })
        .eq("email", email);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Premium granted" });

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