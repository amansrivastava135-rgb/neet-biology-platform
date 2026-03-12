"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { WeakChapters } from "@/components/dashboard/weak-chapters";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ProgressCards } from "@/components/dashboard/progress-cards";
import { getResults, summarize, TestResult } from "@/lib/analytics";
import { Loader2 } from "lucide-react";

function DashboardContent() {
  const { user, isLoading, progress } = useAuth();
  const router = useRouter();

  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setResults(getResults());
    }
  }, []);

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

  if (!user) {
    return null;
  }

  const { totalTests, avgAccuracy, bestScore, topicStats } = summarize(results);
  const strongTopics = [...topicStats].sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);
  const weakTopics = [...topicStats].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  const recentHistory = results.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {user.isPaid 
                ? `You have premium access to all features.${user.expiryDate ? ` Expires on ${new Date(user.expiryDate).toLocaleDateString()}.` : ""}` 
                : "Upgrade to premium for full access to all chapters and mock tests."}
            </p>
          </div>

          {/* Quick Actions */}
          <QuickActions isPaid={user.isPaid} />

          {/* Stats Overview */}
          <DashboardStats progress={progress} />

          {/* Performance Summary Cards (from mock test history) */}
          <div className="mt-6">
            <ProgressCards results={results} />
          </div>

          {/* Topic Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-2">Strong Topics</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {strongTopics.map((t) => (
                  <li key={t.topic}>{t.topic} ({Math.round(t.accuracy)}%)</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground mb-2">Weak Topics</h2>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {weakTopics.map((t) => (
                  <li key={t.topic}>{t.topic} ({Math.round(t.accuracy)}%)</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Test History */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-foreground mb-2">Recent Tests</h2>
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
          </div>

          {/* Charts and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ProgressChart progress={progress} />
            <WeakChapters progress={progress} />
          </div>

          {/* Recent Activity */}
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
      <DashboardContent />
    </AuthProvider>
  );
}
