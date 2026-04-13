import { supabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// GET user progress from Supabase
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("user_chapter_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error fetching progress:", error);
      return NextResponse.json(
        { error: error.message ?? "Failed to fetch progress" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        totalAttempted: 0,
        totalCorrect: 0,
        chapterProgress: {},
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

// POST/UPDATE user progress in Supabase
export async function POST(request: NextRequest) {
  try {
    const { userId, totalAttempted, totalCorrect, chapterProgress } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if progress exists
    const { data: existing, error: existingError } = await supabaseServer
      .from("user_chapter_progress")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      console.error("Supabase error checking existing progress:", existingError);
      return NextResponse.json(
        { error: existingError.message ?? "Failed to update progress" },
        { status: 500 }
      );
    }

    let result;

    if (existing) {
      // Update existing progress
      result = await supabaseServer
        .from("user_chapter_progress")
        .update({
          totalAttempted,
          totalCorrect,
          chapterProgress,
          updatedAt: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select();
    } else {
      // Insert new progress
      result = await supabaseServer
        .from("user_chapter_progress")
        .insert({
          user_id: userId,
          totalAttempted,
          totalCorrect,
          chapterProgress,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select();
    }

    if (result.error) {
      console.error("Supabase error writing progress:", result.error);
      return NextResponse.json(
        { error: result.error.message ?? "Failed to update progress" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data?.[0]);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update progress" },
      { status: 500 }
    );
  }
}
