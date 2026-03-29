import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SET_SIZE = 90;

// GET — chapter ke questions fetch karo (set-wise)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");
  const setNumber = searchParams.get("setNumber");

  if (!chapterId) {
    return NextResponse.json({ error: "chapterId required" }, { status: 400 });
  }

  // Saare questions fetch karo is chapter ke
  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .eq("chapter_id", parseInt(chapterId))
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json({ questions: [], sets: [] });
  }

  // Set info calculate karo
  const totalSets = Math.ceil(questions.length / SET_SIZE);
  const sets = Array.from({ length: totalSets }, (_, i) => ({
    setNumber: i + 1,
    questionCount: Math.min(SET_SIZE, questions.length - i * SET_SIZE),
    label: `Set ${i + 1}`,
  }));

  // Agar setNumber diya hai toh sirf wo set return karo
  if (setNumber) {
    const setNum = parseInt(setNumber);
    const start = (setNum - 1) * SET_SIZE;
    const setQuestions = questions.slice(start, start + SET_SIZE);
    return NextResponse.json({ questions: setQuestions, sets });
  }

  return NextResponse.json({ questions, sets });
}

// POST — naya question add karo
export async function POST(req: Request) {
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

  // Duplicate check — same question same chapter mein already hai?
  const { data: existing } = await supabase
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

  // Total questions count karo is chapter mein
  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("chapter_id", chapter_id);

  // Auto set number assign karo
  const autoSetNumber = Math.floor((count || 0) / SET_SIZE) + 1;

  const { data, error } = await supabase.from("questions").insert({
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
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, question: data });
}

// DELETE — question delete karo
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", parseInt(id));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}