import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // URL se userId ignore karo — JWT se lo (spoofing prevent)
    const { data, error } = await supabaseAdmin
      .from("user_chapter_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        totalAttempted: 0,
        totalCorrect: 0,
        chapterProgress: {},
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching progress:", err);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { totalAttempted, totalCorrect, chapterProgress } = await request.json();

    // userId body se nahi — JWT se
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("user_chapter_progress")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    let result;

    if (existing) {
      result = await supabaseAdmin
        .from("user_chapter_progress")
        .update({
          totalAttempted,
          totalCorrect,
          chapterProgress,
          updatedAt: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select();
    } else {
      result = await supabaseAdmin
        .from("user_chapter_progress")
        .insert({
          user_id: user.id,
          totalAttempted,
          totalCorrect,
          chapterProgress,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data?.[0]);
  } catch (err) {
    console.error("Error updating progress:", err);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}