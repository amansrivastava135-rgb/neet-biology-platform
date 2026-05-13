"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { hasMiniMock, isTrial, getMiniMockUseLimit } from "@/lib/checkPremium";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, XCircle, ArrowRight, Trophy, Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const MINI_MOCK_QUESTIONS = 25;
const MINI_MOCK_COOLDOWN_DAYS = 3; // non-trial users: once every 3 days

const CLASS11_CHAPTER_IDS = Array.from({ length: 22 }, (_, i) => i + 1);   // 1–22
const CLASS12_CHAPTER_IDS = Array.from({ length: 16 }, (_, i) => i + 23);  // 23–38

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

type AnswerMap = Record<string, string>;
type ResultMap = Record<string, "correct" | "wrong">;
type Track     = "class11" | "class12" | "dropper";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function daysBetween(date1: Date, date2: Date): number {
  return Math.floor(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

function getChapterIdsForTrack(track: Track): number[] {
  if (track === "class11") return CLASS11_CHAPTER_IDS;
  if (track === "class12") return CLASS12_CHAPTER_IDS;
  return [...CLASS11_CHAPTER_IDS, ...CLASS12_CHAPTER_IDS];
}

// ─── Component ────────────────────────────────────────────────────────────────

function MiniMockContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [questions, setQuestions]       = useState<Question[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [usesCount, setUsesCount]       = useState(0);
  const [lastUsedDate, setLastUsedDate] = useState<Date | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [daysUntilNext, setDaysUntilNext]   = useState(0);
  const [started, setStarted]           = useState(false);
  const [track, setTrack]               = useState<Track>("class12");

  const [currentIdx, setCurrentIdx]           = useState(0);
  const [selected, setSelected]               = useState<AnswerMap>({});
  const [results, setResults]                 = useState<ResultMap>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished]               = useState(false);
  const [score, setScore]                     = useState(0);

  const isTrialUser = isTrial(user);
  const useLimit    = getMiniMockUseLimit(user);

  // ── Access guard ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && !hasMiniMock(user)) router.push("/pricing");
  }, [user, isLoading, router]);

  // ── Load user track from DB ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    supabase
      .from("users")
      .select("track")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.track) setTrack(data.track as Track);
      });
  }, [user]);

  // ── Check use count + cooldown from Supabase ────────────────────────────
  const checkUseStatus = useCallback(async () => {
    if (!user) return;
    setFetchLoading(true);
    try {
      const { data: uses } = await supabase
        .from("mini_mock_uses")
        .select("used_at")
        .eq("user_id", user.id)
        .order("used_at", { ascending: false });

      const count = uses?.length ?? 0;
      setUsesCount(count);

      if (count > 0 && uses) {
        const latest = new Date(uses[0].used_at);
        setLastUsedDate(latest);

        if (isTrialUser) {
          if (useLimit !== null && count >= useLimit) {
            setLimitReached(true);
          }
        } else {
          const daysSinceLast = daysBetween(latest, new Date());
          if (daysSinceLast < MINI_MOCK_COOLDOWN_DAYS) {
            setCooldownActive(true);
            setDaysUntilNext(MINI_MOCK_COOLDOWN_DAYS - daysSinceLast);
          }
        }
      }
    } catch (err) {
      console.error("Mini mock use check error:", err);
    } finally {
      setFetchLoading(false);
    }
  }, [user, isTrialUser, useLimit]);

  useEffect(() => {
    if (user) checkUseStatus();
  }, [user, checkUseStatus]);

  // ── Fetch 25 questions based on track ───────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    if (!user) return;
    try {
      const chapterIds = getChapterIdsForTrack(track);
      const { data } = await supabase
        .from("questions")
        .select("id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, chapter_name, chapter_id, source, year")
        .in("chapter_id", chapterIds)
        .limit(300);

      const mixed = shuffle(data ?? []).slice(0, MINI_MOCK_QUESTIONS);
      setQuestions(mixed);
    } catch (err) {
      console.error("Mini mock fetch error:", err);
    }
  }, [user, track]);

  // ── Record use in Supabase ───────────────────────────────────────────────
  async function recordUse() {
    if (!user) return;
    try {
      await supabase.from("mini_mock_uses").insert({
        user_id: user.id,
        used_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Mini mock record error:", err);
    }
  }

  async function handleStart() {
    await fetchQuestions();
    await recordUse();
    setStarted(true);
  }

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
      finishSession();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  function finishSession() {
    const correct  = Object.values(results).filter((r) => r === "correct").length;
    const total    = questions.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    setScore(correct);
    setFinished(true);
    // Set cooldown so re-navigation is blocked (checked after finished in render order)
    if (!isTrialUser) {
      setCooldownActive(true);
      setDaysUntilNext(MINI_MOCK_COOLDOWN_DAYS);
    }
    if (user?.subscriptionPlan === "guided") {
      fetch("/api/guided-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskType: "mini_test", score: correct, accuracy }),
      }).catch((err) => console.error("Guided plan mark complete error:", err));
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

  // ── Trial limit reached ──────────────────────────────────────────────────
  if (limitReached) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Trial Limit Reached</h2>
            <p className="text-muted-foreground text-sm mb-2">
              You&apos;ve used both your trial Mini Mocks (2 of 2).
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              Upgrade to Premium or Guided Plan for unlimited Mini Mocks.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild><Link href="/pricing?ref=mini-mock-limit">Upgrade Now</Link></Button>
              <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Finished screen — MUST be before cooldownActive check ────────────────
  // (finishSession sets both finished=true and cooldownActive=true;
  //  checking finished first ensures results screen always shows after test)
  if (finished) {
    const total = questions.length;
    const pct   = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-1">Mini Mock Complete!</h2>
            <p className="text-4xl font-bold text-primary my-4">{score}/{total}</p>
            <p className="text-muted-foreground text-sm mb-2">Accuracy: {pct}%</p>
            <p className="text-xs text-muted-foreground mb-6">
              {pct >= 80
                ? "Excellent performance! 🔥"
                : pct >= 50
                ? "Good effort — review weak areas 📖"
                : "Keep practicing — you've got this 💪"}
            </p>
            {isTrialUser && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                Liked the Mini Mock? Upgrade for unlimited access every 3 days.
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
              {isTrialUser && (
                <Button variant="outline" asChild>
                  <Link href="/pricing?ref=mini-mock-done">Upgrade to Premium</Link>
                </Button>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Cooldown active (paid, non-trial) ────────────────────────────────────
  if (cooldownActive) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <Clock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Next Mini Mock in {daysUntilNext} Day{daysUntilNext !== 1 ? "s" : ""}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Mini Mock is available once every 3 days for best retention results.
              {lastUsedDate && ` Last taken: ${lastUsedDate.toLocaleDateString()}`}
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild><Link href="/practice">Practice Chapters Instead</Link></Button>
              <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Track selector + Start screen ────────────────────────────────────────
  if (!started) {
    const remainingUses = useLimit !== null ? useLimit - usesCount : null;
    const trackLabels: Record<Track, string> = {
      class11: "Class 11",
      class12: "Class 12",
      dropper: "Dropper (Both)",
    };

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-foreground mb-2">Mini Mock</h2>
            <p className="text-muted-foreground text-sm mb-4">
              25 questions · {trackLabels[track]} chapters · ~20 minutes
            </p>

            {/* Track selector — only for non-guided users */}
            {user?.subscriptionPlan !== "guided" && (
              <div className="mb-5">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Select your track:</p>
                <div className="flex gap-2 justify-center">
                  {(["class11", "class12", "dropper"] as Track[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTrack(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        track === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {trackLabels[t]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Guided users — show auto-selected track as info */}
            {user?.subscriptionPlan === "guided" && (
              <div className="mb-5 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700 text-center">
                Track: <span className="font-semibold">{trackLabels[track]}</span> (from your Guided Plan)
              </div>
            )}

            {isTrialUser && remainingUses !== null && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                Trial: {remainingUses} attempt{remainingUses !== 1 ? "s" : ""} remaining
              </div>
            )}

            <ul className="text-sm text-muted-foreground text-left space-y-1 mb-6 px-2">
              <li>✅ 25 questions from {trackLabels[track]} chapters</li>
              <li>✅ Includes PYQs</li>
              <li>✅ Instant explanation after each answer</li>
              <li>✅ Score + accuracy at the end</li>
            </ul>

            <Button onClick={handleStart} className="w-full" size="lg">
              Start Mini Mock
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Quiz interface ────────────────────────────────────────────────────────
  const q = questions[currentIdx];
  if (!q) return null;

  const options = [
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
            <Badge variant="secondary">📝 Mini Mock</Badge>
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

export default function MiniMockPage() {
  return (
    <AuthProvider>
      <MiniMockContent />
    </AuthProvider>
  );
}