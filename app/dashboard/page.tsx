"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { WeakChapters } from "@/components/dashboard/weak-chapters";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Loader2 } from "lucide-react";

function DashboardContent() {
  const { user, isLoading, progress } = useAuth();
  const router = useRouter();

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
                ? "You have premium access to all features." 
                : "Upgrade to premium for full access to all chapters and mock tests."}
            </p>
          </div>

          {/* Quick Actions */}
          <QuickActions isPaid={user.isPaid} />

          {/* Stats Overview */}
          <DashboardStats progress={progress} />

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
