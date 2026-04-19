import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";
import { sampleQuestions } from "@/lib/data";

const SET_SIZE = 90;

export async function POST() {
  // Sirf admin seed kar sakta hai
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let inserted = 0;
  let skipped = 0;

  const byChapter: Record<number, typeof sampleQuestions> = {};
  for (const q of sampleQuestions) {
    if (!byChapter[q.chapterId]) byChapter[q.chapterId] = [];
    byChapter[q.chapterId].push(q);
  }

  for (const [chapterId, questions] of Object.entries(byChapter)) {
    const { count } = await supabaseAdmin
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("chapter_id", parseInt(chapterId));

    let currentCount = count || 0;

    for (const q of questions) {
      const { data: existing } = await supabaseAdmin
        .from("questions")
        .select("id")
        .eq("chapter_id", q.chapterId)
        .eq("question", q.question)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const setNumber = Math.floor(currentCount / SET_SIZE) + 1;

      const { error } = await supabaseAdmin.from("questions").insert({
        question: q.question,
        option_a: q.options.A,
        option_b: q.options.B,
        option_c: q.options.C,
        option_d: q.options.D,
        correct_answer: q.correctAnswer,
        explanation: q.explanation,
        chapter_id: q.chapterId,
        chapter_name: q.chapterName,
        source: q.source,
        year: q.year || null,
        set_number: setNumber,
      });

      if (!error) {
        inserted++;
        currentCount++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    inserted,
    skipped,
    message: `${inserted} questions inserted, ${skipped} skipped`,
  });
}