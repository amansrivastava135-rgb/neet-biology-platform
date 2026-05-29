"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isGuided } from "@/lib/checkPremium";
import { Loader2, CheckCircle2, Circle, Lock, ArrowLeft, Flame, BookOpen, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// ─── Chapter name map (mirrors API) ──────────────────────────────────────────

const CHAPTER_NAMES: Record<number, string> = {
  1: "The Living World", 2: "Biological Classification", 3: "Plant Kingdom",
  4: "Animal Kingdom", 5: "Morphology of Flowering Plants",
  6: "Anatomy of Flowering Plants", 7: "Structural Organisation in Animals",
  8: "Cell – The Unit of Life", 9: "Biomolecules",
  10: "Cell Cycle and Cell Division", 11: "Transport in Plants",
  12: "Mineral Nutrition", 13: "Photosynthesis in Higher Plants",
  14: "Respiration in Plants", 15: "Plant Growth and Development",
  16: "Digestion and Absorption", 17: "Breathing and Exchange of Gases",
  18: "Body Fluids and Circulation", 19: "Excretory Products and their Elimination",
  20: "Locomotion and Movement", 21: "Neural Control and Coordination",
  22: "Chemical Coordination and Integration", 23: "Reproduction in Organisms",
  24: "Sexual Reproduction in Flowering Plants", 25: "Human Reproduction",
  26: "Reproductive Health", 27: "Principles of Inheritance and Variation",
  28: "Molecular Basis of Inheritance", 29: "Evolution",
  30: "Human Health and Disease", 31: "Strategies for Enhancement in Food Production",
  32: "Microbes in Human Welfare", 33: "Biotechnology Principles and Processes",
  34: "Biotechnology and its Applications", 35: "Organisms and Populations",
  36: "Ecosystem", 37: "Biodiversity and Conservation", 38: "Environmental Issues",
};

const CLASS11_IDS = Array.from({ length: 22 }, (_, i) => i + 1);
const CLASS12_IDS = Array.from({ length: 16 }, (_, i) => i + 23);

function getTrackChapterIds(track: string): number[] {
  if (track === "class11") return CLASS11_IDS;
  if (track === "class12") return CLASS12_IDS;
  return [...CLASS11_IDS, ...CLASS12_IDS];
}

function getTrackLabel(track: string): string {
  if (track === "class11") return "Class 11";
  if (track === "class12") return "Class 12";
  return "Dropper (Class 11 + 12)";
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface GuidedPlanData {
  track: string;
  streak: number;
  progressionStep: number;
  completedChapters: number;
  completedChapterIds: number[];
  totalChapters: number;
  percentComplete: number;
}

// ─── Chapter status ───────────────────────────────────────────────────────────

type ChapterStatus = "completed" | "current" | "locked";

function getChapterStatus(
  chapterId: number,
  completedIds: number[],
  progressionStep: number,
  allIds: number[],
  chaptersPerStep: number
): ChapterStatus {
  if (completedIds.includes(chapterId)) return "completed";

  // Current = within current progression window
  const currentWindowStart = progressionStep * chaptersPerStep;
  const currentWindowEnd = currentWindowStart + chaptersPerStep;
  const idx = allIds.indexOf(chapterId);
  if (idx >= currentWindowStart && idx < currentWindowEnd) return "current";

  return "locked";
}

// ─── Main component ───────────────────────────────────────────────────────────

function GuidedProgressContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<GuidedPlanData | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (!isLoading && user && !isGuided(user)) router.push("/pricing");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/guided-plan")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setPlan(data);
      })
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, [user]);

  if (isLoading || fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center p-8 border border-border rounded-xl bg-card">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No Guided Plan Found</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Complete onboarding to set up your guided plan.
            </p>
            <Button asChild><Link href="/onboarding/track">Set Up Plan</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const allIds = getTrackChapterIds(plan.track);
  const chaptersPerStep = 2; // from track_config default
  const completedIds = plan.completedChapterIds ?? [];

  // Group into class 11 / class 12 sections for dropper
  const isDropper = plan.track === "dropper";
  const sections = isDropper
    ? [
        { label: "Class 11", ids: CLASS11_IDS },
        { label: "Class 12", ids: CLASS12_IDS },
      ]
    : [{ label: getTrackLabel(plan.track), ids: allIds }];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-3xl">

          {/* Page header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Guided Progress</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {getTrackLabel(plan.track)} track
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold text-foreground">{plan.streak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold text-foreground">{plan.completedChapters}</span>
              </div>
              <p className="text-xs text-muted-foreground">Chapters Done</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold text-foreground">{plan.totalChapters}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total Chapters</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-card text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-indigo-500" />
                <span className="text-2xl font-bold text-indigo-600">{plan.percentComplete}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mb-8 p-4 rounded-xl border border-indigo-200 bg-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-indigo-900">Overall Progress</span>
              <span className="text-sm font-bold text-indigo-700">
                {plan.completedChapters}/{plan.totalChapters} chapters
              </span>
            </div>
            <div className="w-full h-3 bg-indigo-100 rounded-full overflow-hidden">
              <div
                className="h-3 bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${plan.percentComplete}%` }}
              />
            </div>
            {plan.percentComplete === 100 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-indigo-700 font-medium">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Syllabus complete — you are ready for NEET! 🎉
              </div>
            )}
          </div>

          {/* Chapter map sections */}
          {sections.map((section) => (
            <div key={section.label} className="mb-8">
              {isDropper && (
                <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  {section.label}
                </h2>
              )}

              <div className="space-y-2">
                {section.ids.map((chapterId, idx) => {
                  const status = getChapterStatus(
                    chapterId,
                    completedIds,
                    plan.progressionStep,
                    allIds,
                    chaptersPerStep
                  );
                  const name = CHAPTER_NAMES[chapterId] ?? `Chapter ${chapterId}`;
                  const chapterNum = allIds.indexOf(chapterId) + 1;

                  return (
                    <div
                      key={chapterId}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                        ${status === "completed"
                          ? "border-green-200 bg-green-50"
                          : status === "current"
                          ? "border-indigo-300 bg-indigo-50 shadow-sm"
                          : "border-border bg-card opacity-60"
                        }`}
                    >
                      {/* Status icon */}
                      <div className="shrink-0">
                        {status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : status === "current" ? (
                          <Circle className="h-5 w-5 text-indigo-500 fill-indigo-100" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      {/* Chapter info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium truncate
                            ${status === "completed" ? "text-green-800" :
                              status === "current" ? "text-indigo-800" :
                              "text-muted-foreground"}`}>
                            {name}
                          </span>
                          {status === "current" && (
                            <Badge className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200 shrink-0">
                              Current
                            </Badge>
                          )}
                          {status === "completed" && (
                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200 shrink-0">
                              Done
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Practice link for current/completed chapters */}
                      {status !== "locked" && (
                        <Link
                          href={`/practice?chapter=${chapterId}`}
                          className={`shrink-0 text-xs px-2.5 py-1 rounded-md font-medium transition-colors
                            ${status === "completed"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                            }`}
                        >
                          {status === "completed" ? "Revise" : "Practice"}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground mt-4 pb-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              Completed
            </div>
            <div className="flex items-center gap-1.5">
              <Circle className="h-3.5 w-3.5 text-indigo-500" />
              Current
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Locked
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function GuidedProgressPage() {
  return (
    <AuthProvider>
      <GuidedProgressContent />
    </AuthProvider>
  );
}
