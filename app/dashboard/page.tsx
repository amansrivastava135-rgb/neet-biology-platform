"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { PremiumGuard } from "@/components/premium-guard";
import { isPremium, isTrial } from "@/lib/checkPremium";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import dynamic from "next/dynamic";
import { getRemainingDays } from "@/lib/subscription-utils";

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
      try {
        const progressKey = `neet_progress_${user.id}`;
        const stored = localStorage.getItem(progressKey);
        if (stored) {
          setProgress(JSON.parse(stored));
        } else {
          setProgress({ totalAttempted: 0, totalCorrect: 0, chapterProgress: {} });
        }
      } catch {
        // ignore
      }
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user.name}!
            </h1>
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