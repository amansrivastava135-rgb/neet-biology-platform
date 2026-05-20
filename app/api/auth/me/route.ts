import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const jwtUser = await getCurrentUser();
    if (!jwtUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fresh data from DB — not from JWT cache
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, is_paid, is_admin, subscription_plan, subscription_start, subscription_end, track")
      .eq("id", jwtUser.id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = user.is_admin === true || (adminEmail ? user.email === adminEmail : false);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isPaid: user.is_paid ?? false,
      isAdmin,
      subscriptionPlan: user.subscription_plan ?? "free",
      subscriptionStart: user.subscription_start ?? null,
      subscriptionEnd: user.subscription_end ?? null,
      subscription: user.is_paid ? "active" : "free",
      track: user.track ?? null,
    });
  } catch (err) {
    console.error("me route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}