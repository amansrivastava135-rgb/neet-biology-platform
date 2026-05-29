"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { hasDaily10Q } from "@/lib/checkPremium";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string; // DB: uppercase "A","B","C","D"
  explanation: string;
  chapter_name: string;
  source: string;         // DB: uppercase "PYQ","NCERT"
  year: string | null;
}

type AnswerMap = Record<string, string>;
type ResultMap = Record<string, "correct" | "wrong">;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyStorageKey(userId: string) {
  return `daily10q_done_${userId}_${getTodayKey()}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Component ────────────────────────────────────────────────────────────────

function Daily10QContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [questions, setQuestions]       = useState<Question[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [alreadyDone, setAlreadyDone]   = useState(false);

  const [currentIdx, setCurrentIdx]         = useState(0);
  const [selected, setSelected]             = useState<AnswerMap>({});
  const [results, setResults]               = useState<ResultMap>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished]             = useState(false);
  const [score, setScore]                   = useState(0);

  // ── Access guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && !hasDaily10Q(user)) router.push("/pricing");
  }, [user, isLoading, router]);

  // ── Already done today? ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const done = localStorage.getItem(getDailyStorageKey(user.id));
    if (done) setAlreadyDone(true);
  }, [user]);

  // ── Fetch 10 questions (3 PYQ + 7 NCERT) ───────────────────────────────
  const fetchQuestions = useCallback(async () => {
    if (!user) return;
    setFetchLoading(true);
    try {
      // source in DB is uppercase "PYQ"
      const { data: pyqData } = await supabase
        .from("questions")
        .select("id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, chapter_name, source, year")
        .eq("source", "PYQ")
        .limit(60);

      const { data: ncertData } = await supabase
        .from("questions")
        .select("id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, chapter_name, source, year")
        .neq("source", "PYQ")
        .limit(200);

      const pyqPick   = shuffle(pyqData   ?? []).slice(0, 3);
      const ncertPick = shuffle(ncertData ?? []).slice(0, 7);
      setQuestions(shuffle([...pyqPick, ...ncertPick]));
    } catch (err) {
      console.error("Daily 10Q fetch error:", err);
    } finally {
      setFetchLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !alreadyDone) fetchQuestions();
    else if (user && alreadyDone) setFetchLoading(false);
  }, [user, alreadyDone, fetchQuestions]);

  // ── Answer selection ────────────────────────────────────────────────────
  function handleSelect(optionKey: string) {
    const q = questions[currentIdx];
    if (!q || selected[q.id]) return;

    // Always compare uppercase — DB stores "A","B","C","D"
    const upperKey  = optionKey.toUpperCase();
    const isCorrect = upperKey === q.correct_answer.toUpperCase();

    setSelected((prev) => ({ ...prev, [q.id]: upperKey }));
    setResults((prev)  => ({ ...prev, [q.id]: isCorrect ? "correct" : "wrong" }));
    setShowExplanation(true);
  }

  function handleNext() {
    setShowExplanation(false);
    if (currentIdx + 1 >= questions.length) {
      finishSession();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  function finishSession() {
  const correct = Object.values(results).filter((r) => r === "correct").length;
  setScore(correct);
  setFinished(true);
  if (user) {
    localStorage.setItem(getDailyStorageKey(user.id), "1");
    // Notify guided plan engine (fire-and-forget — non-blocking)
    if (user.subscriptionPlan === "guided") {
      fetch("/api/guided-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: "daily_10q" }),
      }).catch((err) => console.error("Guided plan mark complete error:", err));
    }
  }
}

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading || fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  // ── Already done today ───────────────────────────────────────────────────
  if (alreadyDone) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Today&apos;s Challenge Done! 🎉</h2>
            <p className="text-muted-foreground text-sm mb-6">
              You&apos;ve already completed today&apos;s Daily 10Q. Come back tomorrow for a fresh set!
            </p>
            <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Finished screen ──────────────────────────────────────────────────────
  if (finished) {
    const total = questions.length;
    const pct   = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-1">Daily 10Q Complete!</h2>
            <p className="text-4xl font-bold text-primary my-4">{score}/{total}</p>
            <p className="text-muted-foreground text-sm mb-2">Accuracy: {pct}%</p>
            <p className="text-xs text-muted-foreground mb-6">
              {pct >= 80 ? "Excellent! Keep it up 🔥" : pct >= 50 ? "Good effort! Review the explanations 📖" : "Keep practicing — consistency is key 💪"}
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
              <Button variant="outline" asChild><Link href="/practice">Practice More Chapters</Link></Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  const q = questions[currentIdx];
  if (!q) return null;

  const options    = [
    { key: "A", label: q.option_a },
    { key: "B", label: q.option_b },
    { key: "C", label: q.option_c },
    { key: "D", label: q.option_d },
  ];
  const userAnswer = selected[q.id];
  const answered   = !!userAnswer;
  const correctKey = q.correct_answer.toUpperCase();

  function optionStyle(key: string) {
    if (!answered) return "border-border hover:border-primary hover:bg-primary/5 cursor-pointer";
    if (key === correctKey) return "border-green-400 bg-green-50 text-green-900";
    if (key === userAnswer) return "border-red-400 bg-red-50 text-red-900";
    return "border-border opacity-50";
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-2xl">

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Question {currentIdx + 1} of {questions.length}</span>
            <Badge variant="secondary">⚡ Daily 10Q</Badge>
          </div>
          <div className="w-full h-2 bg-muted rounded-full mb-6">
            <div className="h-2 bg-primary rounded-full transition-all"
              style={{ width: `${(currentIdx / questions.length) * 100}%` }} />
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            {q.chapter_name}
            {q.source === "PYQ" && q.year && (
              <span className="ml-2 text-primary font-medium">PYQ {q.year}</span>
            )}
          </p>

          <h2 className="text-base font-medium text-foreground mb-5 leading-relaxed">{q.question}</h2>

          <div className="flex flex-col gap-3 mb-6">
            {options.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={answered}
                className={`w-full text-left p-4 rounded-lg border text-sm transition-all ${optionStyle(key)}`}
              >
                <span className="font-medium mr-2">{key}.</span>{label}
                {answered && key === correctKey && <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-600" />}
                {answered && key === userAnswer && key !== correctKey && <XCircle className="inline ml-2 h-4 w-4 text-red-500" />}
              </button>
            ))}
          </div>

          {showExplanation && q.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 mb-6">
              <p className="font-semibold mb-1">Explanation</p>
              <p>{q.explanation}</p>
            </div>
          )}

          {answered && (
            <Button onClick={handleNext} className="w-full gap-2">
              {currentIdx + 1 >= questions.length ? "See Results" : "Next Question"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Daily10QPage() {
  return (
    <AuthProvider>
      <Daily10QContent />
    </AuthProvider>
  );
}
