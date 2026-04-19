import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Admin auth check
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, is_paid, subscription_end, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const students = data.map((u: any) => ({
      id: u.id,
      name: u.name || "Unknown",
      email: u.email,
      isPaid: u.is_paid || false,
      joinedAt: u.created_at
        ? new Date(u.created_at).toLocaleDateString()
        : "N/A",
      subscriptionEnd: u.subscription_end || undefined,
    }));

    return NextResponse.json({ students });
  } catch (err) {
    console.error("Students fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}