"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isGuided } from "@/lib/checkPremium";
import { supabase } from "@/lib/supabase";
import {
  Loader2, CheckCircle2, XCircle, ArrowRight,
  Trophy, Clock, Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKLY_MOCK_QUESTIONS = 60;
const WEEKLY_MOCK_MINUTES   = 60;
const WEEKLY_MOCK_INTERVAL  = 7; // days

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  chapter_name: string;
  chapter_id: number;
  source: string;
  year: string | null;
}

interface GuidedState {
  track: string;
  progression_step: number;
  last_weekly_mock_date: string | null;
}

type AnswerMap = Record<string, string>;
type ResultMap = Record<string, "correct" | "wrong">;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function daysBetween(a: string, b: string): number {
  return Math.floor(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// Chapter IDs for weekly mock based on progression step
// Cycle: step%3==0 → ch[pair*2], step%3==1 → ch[pair*2+1], step%3==2 → both
const CLASS11_IDS = Array.from({ length: 22 }, (_, i) => i + 1);
const CLASS12_IDS = Array.from({ length: 16 }, (_, i) => i + 23);
const ALL_IDS     = [...CLASS11_IDS, ...CLASS12_IDS];

function getTrackChapters(track: string): number[] {
  if (track === "class11") return CLASS11_IDS;
  if (track === "class12") return CLASS12_IDS;
  return ALL_IDS;
}

function getMockChapterIds(track: string, step: number): number[] {
  const chapters = getTrackChapters(track);
  const cycle    = step % 3;
  const pair     = Math.floor(step / 3);
  if (cycle === 0) return [chapters[pair * 2]].filter(Boolean);
  if (cycle === 1) return [chapters[pair * 2 + 1]].filter(Boolean);
  return [chapters[pair * 2], chapters[pair * 2 + 1]].filter(Boolean);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── Timer component ──────────────────────────────────────────────────────────

function CountdownTimer({
  totalSeconds,
  onExpire,
}: {
  totalSeconds: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (remaining <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onExpire]);

  const pct     = (remaining / totalSeconds) * 100;
  const urgent  = remaining < 300; // last 5 mins

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-semibold
      ${urgent ? "border-red-300 bg-red-50 text-red-700" : "border-border bg-muted text-foreground"}`}>
      <Clock className="h-4 w-4" />
      {formatTime(remaining)}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function WeeklyMockContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [guidedState, setGuidedState]     = useState<GuidedState | null>(null);
  const [fetchLoading, setFetchLoading]   = useState(true);
  const [daysUntilNext, setDaysUntilNext] = useState(0);
  const [mockChapterIds, setMockChapterIds] = useState<number[]>([]);
  const [mockChapterNames, setMockChapterNames] = useState<string[]>([]);

  const [questions, setQuestions]   = useState<Question[]>([]);
  const [started, setStarted]       = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected]     = useState<AnswerMap>({});
  const [results, setResults]       = useState<ResultMap>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished]     = useState(false);
  const [score, setScore]           = useState(0);
  const [timeTaken, setTimeTaken]   = useState(0);
  const startTimeRef                = useRef<number>(0);

  // ── Access guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && !isGuided(user)) router.push("/pricing");
  }, [user, isLoading, router]);

  // ── Load guided state ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_guided_state")
      .select("track, progression_step, last_weekly_mock_date")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setFetchLoading(false); return; }
        setGuidedState(data);

        // Calculate cooldown
        if (data.last_weekly_mock_date) {
          const days = daysBetween(data.last_weekly_mock_date, todayISO());
          if (days < WEEKLY_MOCK_INTERVAL) {
            setDaysUntilNext(WEEKLY_MOCK_INTERVAL - days);
          }
        }

        // Determine chapter IDs for this mock
        const ids = getMockChapterIds(data.track, data.progression_step);
        setMockChapterIds(ids);

        setFetchLoading(false);
      });
  }, [user]);

  // ── Fetch chapter names for display ─────────────────────────────────────
  useEffect(() => {
    if (!mockChapterIds.length) return;
    supabase
      .from("questions")
      .select("chapter_id, chapter_name")
      .in("chapter_id", mockChapterIds)
      .limit(mockChapterIds.length * 2)
      .then(({ data }) => {
        if (!data) return;
        const names = [...new Set(data.map((d) => d.chapter_name))];
        setMockChapterNames(names);
      });
  }, [mockChapterIds]);

  // ── Fetch questions ──────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    if (!user || !mockChapterIds.length) return;
    try {
      const { data } = await supabase
        .from("questions")
        .select("id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, chapter_name, chapter_id, source, year")
        .in("chapter_id", mockChapterIds)
        .limit(300);

      const mixed = shuffle(data ?? []).slice(0, WEEKLY_MOCK_QUESTIONS);
      setQuestions(mixed);
    } catch (err) {
      console.error("Weekly mock fetch error:", err);
    }
  }, [user, mockChapterIds]);

  // ── Mark complete in guided plan ─────────────────────────────────────────
  async function markComplete(finalScore: number, accuracy: number, chapterNames: string[]) {
    try {
      await fetch("/api/guided-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: "weekly_mock",
          score: finalScore,
          accuracy,
          chapterNames, // saved to task_ref_id
        }),
      });
    } catch (err) {
      console.error("Weekly mock mark complete error:", err);
    }
  }

  async function handleStart() {
    await fetchQuestions();
    startTimeRef.current = Date.now();
    setStarted(true);
  }

  // ── Timer expired → auto submit ──────────────────────────────────────────
  const handleTimerExpire = useCallback(() => {
    if (!finished) finishSession(true);
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Answer selection ─────────────────────────────────────────────────────
  function handleSelect(optionKey: string) {
    const q = questions[currentIdx];
    if (!q || selected[q.id]) return;

    const upperKey  = optionKey.toUpperCase();
    const isCorrect = upperKey === q.correct_answer.toUpperCase();

    setSelected((prev) => ({ ...prev, [q.id]: upperKey }));
    setResults((prev)  => ({ ...prev, [q.id]: isCorrect ? "correct" : "wrong" }));
    setShowExplanation(true);
  }

  function handleNext() {
    setShowExplanation(false);
    if (currentIdx + 1 >= questions.length) {
      finishSession(false);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  function finishSession(timerExpired = false) {
    const taken = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTimeTaken(taken);

    const correct  = Object.values(results).filter((r) => r === "correct").length;
    const total    = questions.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    setScore(correct);
    setFinished(true);
    markComplete(correct, accuracy, mockChapterNames);
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

  // ── Not a guided user (no state) ─────────────────────────────────────────
  if (!guidedState) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Guided Plan Required</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Weekly Mock is part of the Guided Preparation Plan.
            </p>
            <Button asChild><Link href="/pricing">View Plans</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Cooldown active ───────────────────────────────────────────────────────
  if (daysUntilNext > 0 && !started && !finished) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <Clock className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Weekly Mock in {daysUntilNext} Day{daysUntilNext !== 1 ? "s" : ""}
            </h2>
            <p className="text-muted-foreground text-sm mb-2">
              Weekly Mock is scheduled once every {WEEKLY_MOCK_INTERVAL} days for best retention.
            </p>
            {guidedState.last_weekly_mock_date && (
              <p className="text-xs text-muted-foreground mb-6">
                Last taken: {new Date(guidedState.last_weekly_mock_date).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            )}
            {/* Next mock preview */}
            {mockChapterNames.length > 0 && (
              <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800">
                <p className="font-medium mb-1">Upcoming mock covers:</p>
                <p>{mockChapterNames.join(" + ")}</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button asChild><Link href="/practice">Practice Chapters</Link></Button>
              <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Start screen ─────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-foreground mb-1">Weekly Mock Test</h2>
            <Badge variant="outline" className="mb-4 border-indigo-300 text-indigo-700">
              Guided Plan
            </Badge>

            {mockChapterNames.length > 0 && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800">
                <p className="font-medium mb-1">This week&apos;s chapters:</p>
                <p>{mockChapterNames.join(" + ")}</p>
              </div>
            )}

            <ul className="text-sm text-muted-foreground text-left space-y-1.5 mb-6 px-2">
              <li>✅ {WEEKLY_MOCK_QUESTIONS} questions</li>
              <li>✅ {WEEKLY_MOCK_MINUTES} minute timer — auto-submits on expiry</li>
              <li>✅ Instant explanation after each answer</li>
              <li>✅ Score saved to your Guided Plan progress</li>
              <li>⚠️ Once started, you cannot pause the timer</li>
            </ul>

            <Button onClick={handleStart} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
              Start Weekly Mock →
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Finished screen ───────────────────────────────────────────────────────
  if (finished) {
    const total    = questions.length;
    const pct      = total > 0 ? Math.round((score / total) * 100) : 0;
    const mins     = Math.floor(timeTaken / 60);
    const secs     = timeTaken % 60;

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-1">Weekly Mock Complete!</h2>
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200">
              {mockChapterNames.join(" + ")}
            </Badge>
            <p className="text-4xl font-bold text-primary my-4">{score}/{total}</p>
            <p className="text-muted-foreground text-sm mb-1">Accuracy: {pct}%</p>
            <p className="text-xs text-muted-foreground mb-1">
              Time taken: {mins}m {secs}s
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              {pct >= 80
                ? "Outstanding! Chapter mastered 🔥"
                : pct >= 60
                ? "Good work — review the explanations 📖"
                : "Revise this chapter before moving on 💪"}
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/practice">Continue Chapter Practice</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Quiz interface ────────────────────────────────────────────────────────
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

          {/* Header row */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🎯 Weekly Mock</Badge>
              <CountdownTimer
                totalSeconds={WEEKLY_MOCK_MINUTES * 60}
                onExpire={handleTimerExpire}
              />
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full mb-6">
            <div
              className="h-2 bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(currentIdx / questions.length) * 100}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            {q.chapter_name}
            {q.source === "PYQ" && q.year && (
              <span className="ml-2 text-primary font-medium">PYQ {q.year}</span>
            )}
          </p>

          <h2 className="text-base font-medium text-foreground mb-5 leading-relaxed">
            {q.question}
          </h2>

          <div className="flex flex-col gap-3 mb-6">
            {options.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={answered}
                className={`w-full text-left p-4 rounded-lg border text-sm transition-all ${optionStyle(key)}`}
              >
                <span className="font-medium mr-2">{key}.</span>{label}
                {answered && key === correctKey && (
                  <CheckCircle2 className="inline ml-2 h-4 w-4 text-green-600" />
                )}
                {answered && key === userAnswer && key !== correctKey && (
                  <XCircle className="inline ml-2 h-4 w-4 text-red-500" />
                )}
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
            <Button onClick={handleNext} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
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

export default function WeeklyMockPage() {
  return (
    <AuthProvider>
      <WeeklyMockContent />
    </AuthProvider>
  );
}