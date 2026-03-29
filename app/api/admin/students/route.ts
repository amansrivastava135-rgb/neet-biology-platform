import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, is_paid, subscription_end, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
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