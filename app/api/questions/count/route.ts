import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");

  if (!chapterId) {
    return NextResponse.json({ error: "chapterId required" }, { status: 400 });
  }

  // Sirf count — poore questions nahi, bahut fast
  const { count, error } = await supabaseAdmin
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("chapter_id", parseInt(chapterId));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: count || 0 });
}