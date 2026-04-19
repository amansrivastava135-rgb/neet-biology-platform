import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

const SET_SIZE = 90;

export async function GET(req: Request) {
  // Auth check — login hona zaroori hai
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");
  const setNumber = searchParams.get("setNumber");
  const source = searchParams.get("source");
  const year = searchParams.get("year");

  // Premium content check — paid hona zaroori hai
  if (!user.isPaid) {
    // Free users sirf demo questions dekh sakte hain
    const isDemoRequest = searchParams.get("demo") === "true";
    if (!isDemoRequest) {
      return NextResponse.json({ error: "Subscription required" }, { status: 403 });
    }
  }

  let query = supabaseAdmin.from("questions").select("*");

  if (chapterId) query = query.eq("chapter_id", parseInt(chapterId));
  if (source) query = query.eq("source", source);
  if (year) query = query.eq("year", parseInt(year));

  // Free users ke liye demo mode — sirf pehle 10 questions
  if (!user.isPaid) {
    query = query.limit(10);
  }

  const { data: questions, error } = await query.order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json({ questions: [], sets: [] });
  }

  const totalSets = Math.ceil(questions.length / SET_SIZE);
  const sets = Array.from({ length: totalSets }, (_, i) => ({
    setNumber: i + 1,
    questionCount: Math.min(SET_SIZE, questions.length - i * SET_SIZE),
    label: `Set ${i + 1}`,
  }));

  if (setNumber) {
    const setNum = parseInt(setNumber);
    const start = (setNum - 1) * SET_SIZE;
    const setQuestions = questions.slice(start, start + SET_SIZE);
    return NextResponse.json({ questions: setQuestions, sets });
  }

  return NextResponse.json({ questions, sets });
}

export async function POST(req: Request) {
  // Sirf admin POST kar sakta hai
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    question,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    explanation,
    chapter_id,
    chapter_name,
    source,
    year,
  } = body;

  if (!question || !chapter_id || !correct_answer) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from("questions")
    .select("id")
    .eq("chapter_id", chapter_id)
    .eq("question", question)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Question already exists in this chapter" },
      { status: 409 }
    );
  }

  const { count } = await supabaseAdmin
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("chapter_id", chapter_id);

  const autoSetNumber = Math.floor((count || 0) / SET_SIZE) + 1;

  const { data, error } = await supabaseAdmin
    .from("questions")
    .insert({
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      explanation,
      chapter_id,
      chapter_name,
      source,
      year,
      set_number: autoSetNumber,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, question: data });
}

export async function DELETE(req: Request) {
  // Sirf admin DELETE kar sakta hai
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("questions")
    .delete()
    .eq("id", parseInt(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}