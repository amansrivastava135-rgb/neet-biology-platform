import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET — leaderboard fetch karo
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "alltime"; // "weekly" | "alltime"
  const testId = searchParams.get("testId") || "all";

  let query = supabase
    .from("mock_test_results")
    .select("user_id, user_name, score, accuracy, time_taken, created_at, test_id")
    .order("score", { ascending: false })
    .order("accuracy", { ascending: false })
    .order("time_taken", { ascending: true })
    .limit(100);

  // Weekly filter
  if (type === "weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte("created_at", weekAgo.toISOString());
  }

  // Test filter
  if (testId !== "all") {
    query = query.eq("test_id", testId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Best score per user only
  const bestScores = new Map();
  data?.forEach((row) => {
    const existing = bestScores.get(row.user_id);
    if (
      !existing ||
      row.score > existing.score ||
      (row.score === existing.score && row.accuracy > existing.accuracy) ||
      (row.score === existing.score &&
        row.accuracy === existing.accuracy &&
        row.time_taken < existing.time_taken)
    ) {
      bestScores.set(row.user_id, row);
    }
  });

  const ranked = Array.from(bestScores.values()).map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

  return NextResponse.json({ data: ranked });
}

// POST — result save karo
export async function POST(req: Request) {
  const body = await req.json();
  const {
    userId,
    userName,
    testId,
    score,
    accuracy,
    timeTaken,
    correctAnswers,
    wrongAnswers,
    unattempted,
  } = body;

  // Badge check
  const badges = [];
  if (accuracy >= 90) badges.push("accuracy_master");
  if (score >= 300) badges.push("high_scorer");
  if (score === 360) badges.push("perfect_score");

  // Save result
  const { error } = await supabase.from("mock_test_results").insert({
    user_id: userId,
    user_name: userName,
    test_id: testId,
    score,
    accuracy,
    time_taken: timeTaken,
    correct_answers: correctAnswers,
    wrong_answers: wrongAnswers,
    unattempted,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Save badges
  if (badges.length > 0) {
    await supabase.from("user_badges").insert(
      badges.map((badge) => ({
        user_id: userId,
        badge_type: badge,
      }))
    );
  }

  return NextResponse.json({ success: true, badges });
}