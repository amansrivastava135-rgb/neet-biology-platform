"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { PremiumGuard } from "@/components/premium-guard";
import { isPremium, isTrial, hasDaily10Q, hasMiniMock, isGuided } from "@/lib/checkPremium";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import dynamic from "next/dynamic";
import { getRemainingDays } from "@/lib/subscription-utils";
import { fetchUserProgress } from "@/lib/progress-utils";

const ProgressChart = dynamic(
  () => import("@/components/dashboard/progress-chart").then(m => m.ProgressChart),
  { loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded-lg" />, ssr: false }
);

const WeakChapters = dynamic(
  () => import("@/components/dashboard/weak-chapters").then(m => m.WeakChapters),
  { loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded-lg" />, ssr: false }
);

const RecentActivity = dynamic(
  () => import("@/components/dashboard/recent-activity").then(m => m.RecentActivity),
  { loading: () => <div className="h-48 animate-pulse bg-gray-100 rounded-lg" />, ssr: false }
);

import { QuickActions } from "@/components/dashboard/quick-actions";
import { ProgressCards } from "@/components/dashboard/progress-cards";
import { getResults, summarize, TestResult } from "@/lib/analytics";
import { type UserProgress } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ─── Guided Plan Types ────────────────────────────────────────────────────────

interface GuidedTask {
  type: string;
  label: string;
  description: string;
  href: string;
  icon: string;
  isCompleted: boolean;
  chapterNames?: string[];
  daysUntil?: number;
}

interface GuidedPlan {
  track: string;
  streak: number;
  progressionStep: number;
  completedChapters: number;
  totalChapters: number;
  percentComplete: number;
  tasks: GuidedTask[];
}

// ─── Guided Plan Widget ───────────────────────────────────────────────────────

function GuidedPlanWidget() {
  const [plan, setPlan] = useState<GuidedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guided-plan")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setPlan(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg animate-pulse h-36" />
    );
  }

  if (!plan) return null;

  const dueTasks = plan.tasks.filter((t) => (t.daysUntil ?? 0) === 0);
  const upcomingTasks = plan.tasks.filter((t) => (t.daysUntil ?? 0) > 0);
  const pendingTasks = dueTasks.filter((t) => !t.isCompleted);
  const allDone = pendingTasks.length === 0;

  return (
    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-indigo-900">
            🗺️ Guided Plan — Today&apos;s Tasks
          </span>
          {/* Track badge */}
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full capitalize">
            {plan.track.replace("class", "Class ")}
          </span>
        </div>
        {/* Progress */}
        <Link href="/guided-progress" className="text-xs text-indigo-600 font-medium hover:underline">
          {plan.completedChapters}/{plan.totalChapters} chapters · {plan.percentComplete}% →
        </Link>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-indigo-100 rounded-full h-1.5 mb-3">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${plan.percentComplete}%` }}
        />
      </div>

      {/* Broken streak / comeback banner */}
      {plan.streak === 0 && (
        <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💔</span>
            <p className="text-xs text-orange-800 font-medium">
              Streak reset — but every champion has a comeback day. Start fresh today!
            </p>
          </div>
          <Link
            href="/daily-10q"
            className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-md font-medium whitespace-nowrap hover:bg-orange-600 transition-colors"
          >
            Restart Streak
          </Link>
        </div>
      )}

      {/* Broken streak / comeback banner */}
      {plan.streak === 0 && (
        <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💔</span>
            <p className="text-xs text-orange-800 font-medium">
              Streak reset — but every champion has a comeback day. Start fresh today!
            </p>
          </div>
          <Link
            href="/daily-10q"
            className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-md font-medium whitespace-nowrap hover:bg-orange-600 transition-colors"
          >
            Restart Streak
          </Link>
        </div>
      )}

      {/* Broken streak / comeback banner */}
      {plan.streak === 0 && (
        <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💔</span>
            <p className="text-xs text-orange-800 font-medium">
              Streak reset — but every champion has a comeback day. Start fresh today!
            </p>
          </div>
          <Link
            href="/daily-10q"
            className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-md font-medium whitespace-nowrap hover:bg-orange-600 transition-colors"
          >
            Restart Streak
          </Link>
        </div>
      )}

      {/* Broken streak / comeback banner */}
      {plan.streak === 0 && (
        <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💔</span>
            <p className="text-xs text-orange-800 font-medium">
              Streak reset — but every champion has a comeback day. Start fresh today!
            </p>
          </div>
          <Link
            href="/daily-10q"
            className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-md font-medium whitespace-nowrap hover:bg-orange-600 transition-colors"
          >
            Restart Streak
          </Link>
        </div>
      )}
        {/* Broken streak / comeback banner */}
      {plan.streak === 0 && (
        <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💔</span>
            <p className="text-xs text-orange-800 font-medium">
              Streak reset — but every champion has a comeback day. Start fresh today!
            </p>
          </div>
          <Link
            href="/daily-10q"
            className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-md font-medium whitespace-nowrap hover:bg-orange-600 transition-colors"
          >
            Restart Streak
          </Link>
        </div>
      )}
        {/* Broken streak / comeback banner */}
      {plan.streak === 0 && (
        <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💔</span>
            <p className="text-xs text-orange-800 font-medium">
              Streak reset — but every champion has a comeback day. Start fresh today!
            </p>
          </div>
          <Link
            href="/daily-10q"
            className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-md font-medium whitespace-nowrap hover:bg-orange-600 transition-colors"
          >
            Restart Streak
          </Link>
        </div>
      )}
 
        {/* Broken streak / comeback banner */}
      {plan.streak === 0 && (
        <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💔</span>
            <p className="text-xs text-orange-800 font-medium">
              Streak reset — but every champion has a comeback day. Start fresh today!
            </p>
          </div>
          <Link
            href="/daily-10q"
            className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded-md font-medium whitespace-nowrap hover:bg-orange-600 transition-colors"
          >
            Restart Streak
          </Link>
        </div>
      )}

      {/* Tasks */}
      {allDone ? (
        <div className="text-sm text-indigo-700 font-medium text-center py-2">
          ✅ All tasks done for today — great work!
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          {plan.tasks.map((task) => (
            <Link
              key={task.type}
              href={task.href}
              className={`flex-1 flex items-start gap-3 p-3 rounded-lg border transition-all
                ${task.isCompleted
                  ? "bg-white/60 border-indigo-100 opacity-50 pointer-events-none"
                  : "bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-sm cursor-pointer"
                }`}
            >
              <span className="text-xl leading-none mt-0.5">{task.icon}</span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${task.isCompleted ? "line-through text-gray-400" : "text-gray-800"}`}>
                  {task.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
                {task.chapterNames && task.chapterNames.length > 0 && (
                  <p className="text-xs text-indigo-500 mt-0.5 truncate">
                    {task.chapterNames.join(" + ")}
                  </p>
                )}
              </div>
              {task.isCompleted && (
                <span className="ml-auto text-green-500 text-base leading-none">✓</span>
              )}
            </Link>
          ))}
        </div>
      )}
    {/* Upcoming tasks */}
      {upcomingTasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-indigo-100">
          <p className="text-xs text-indigo-500 font-medium mb-2">Coming Up</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.type}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 border border-indigo-100"
              >
                <span className="text-base leading-none">{task.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">{task.label}</p>
                  <p className="text-xs text-indigo-400">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Standard Today's Plan(non-guided paid users) ────────────────────────────

function StandardPlanWidget({
  showDaily10Q,
  showMiniMock,
  isTrialUser,
}: {
  showDaily10Q: boolean;
  showMiniMock: boolean;
  isTrialUser: boolean;
}) {
  if (!showDaily10Q && !showMiniMock) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h2 className="text-sm font-semibold text-blue-900 mb-3">⚡ Today&apos;s Plan</h2>
      <div className="flex flex-col sm:flex-row gap-3">

        {showDaily10Q && (
          <Link
            href="/daily-10q"
            className="flex-1 flex items-start gap-3 p-3 bg-white border border-blue-100 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="text-2xl">⚡</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Daily 10Q Challenge</p>
              <p className="text-xs text-gray-500 mt-0.5">10 quick questions — 5 mins</p>
            </div>
          </Link>
        )}

        {showMiniMock && (
          <Link
            href="/mini-mock"
            className="flex-1 flex items-start gap-3 p-3 bg-white border border-purple-100 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="text-2xl">📝</div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Mini Mock</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isTrialUser ? "25 questions · Trial (2 attempts)" : "25 questions · ~20 mins"}
              </p>
            </div>
          </Link>
        )}

      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function DashboardContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress>({
    totalAttempted: 0,
    totalCorrect: 0,
    chapterProgress: {},
  });

  // Guided streak (only fetched for guided users — avoids extra request for others)
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setResultsLoading(true);
      getResults()
        .then((data) => setResults(data))
        .finally(() => setResultsLoading(false));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProgress(user.id)
        .then((data) => setProgress(data))
        .catch(() => {
          // Fallback to localStorage if API fails
          try {
            const stored = localStorage.getItem(`neet_progress_${user.id}`);
            if (stored) setProgress(JSON.parse(stored));
          } catch {}
        });
    }
  }, [user]);

  // Fetch streak for guided users
  useEffect(() => {
    if (user && isGuided(user)) {
      fetch("/api/guided-plan")
        .then((r) => r.json())
        .then((data) => {
          if (data.streak !== undefined) setStreak(data.streak);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const { totalTests, avgAccuracy, bestScore, topicStats } = summarize(results);
  const strongTopics = [...topicStats].sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);
  const weakTopics = [...topicStats].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  const recentHistory = results.slice(0, 5);
  const remainingDays = getRemainingDays(user);
  const isTrialUser = isTrial(user);
  const showDaily10Q = hasDaily10Q(user);
  const showMiniMock = hasMiniMock(user);
  const isGuidedUser = isGuided(user);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">

          {/* Welcome header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user.name}!
              </h1>
              {/* Streak badge — only for guided users with an active streak */}
              {isGuidedUser && streak !== null && streak > 0 && (
                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full border border-orange-200">
                  🔥 {streak} day{streak !== 1 ? "s" : ""} streak
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {isPremium(user)
                ? `You have premium access to all features.${user.subscriptionEnd ? ` Expires on ${new Date(user.subscriptionEnd).toLocaleDateString()}.` : ""}`
                : "Upgrade to Premium to access this feature."}
            </p>
          </div>

          {/* Trial Expiry Banner */}
          {isTrialUser && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  ⏳ Trial expires in {remainingDays} day{remainingDays !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Upgrade now to keep access to all chapters, mock tests, and analytics
                </p>
              </div>
              <Button size="sm" asChild className="shrink-0">
                <Link href="/pricing?ref=dashboard-trial">Upgrade Now</Link>
              </Button>
            </div>
          )}

          {/* Today's Plan — Guided users get rich widget, others get standard */}
          {isGuidedUser ? (
            <GuidedPlanWidget />
          ) : (
            <StandardPlanWidget
              showDaily10Q={showDaily10Q}
              showMiniMock={showMiniMock}
              isTrialUser={isTrialUser}
            />
          )}

          <QuickActions isPaid={user.isPaid} />

          <DashboardStats progress={progress} />

          <div className="mt-6">
            {resultsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Loading your results...</span>
              </div>
            ) : (
              <ProgressCards results={results} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-2">Strong Topics</h2>
              {resultsLoading ? (
                <div className="h-24 animate-pulse bg-gray-100 rounded-lg" />
              ) : (
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {strongTopics.length > 0 ? (
                    strongTopics.map((t) => (
                      <li key={t.topic}>{t.topic} ({Math.round(t.accuracy)}%)</li>
                    ))
                  ) : (
                    <li>No data yet — attempt some tests!</li>
                  )}
                </ul>
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground mb-2">Weak Topics</h2>
              {resultsLoading ? (
                <div className="h-24 animate-pulse bg-gray-100 rounded-lg" />
              ) : (
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {weakTopics.length > 0 ? (
                    weakTopics.map((t) => (
                      <li key={t.topic}>{t.topic} ({Math.round(t.accuracy)}%)</li>
                    ))
                  ) : (
                    <li>No data yet — attempt some tests!</li>
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium text-foreground mb-2">Recent Tests</h2>
            {resultsLoading ? (
              <div className="h-24 animate-pulse bg-gray-100 rounded-lg" />
            ) : recentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tests attempted yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Score</th>
                    <th className="text-left">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {recentHistory.map((r, idx) => (
                    <tr key={idx}>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>{r.score}</td>
                      <td>{r.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ProgressChart progress={progress} />
            <WeakChapters progress={progress} />
          </div>

          <div className="mt-6">
            <RecentActivity progress={progress} />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <PremiumGuard requiresPremium>
        <DashboardContent />
      </PremiumGuard>
    </AuthProvider>
  );
}
