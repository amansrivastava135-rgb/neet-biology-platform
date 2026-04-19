"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverview } from "@/components/admin/admin-overview";
import { QuestionManager } from "@/components/admin/question-manager";
import { ChapterManager } from "@/components/admin/chapter-manager";
import { StudentManager } from "@/components/admin/student-manager";
import { MockTestManager } from "@/components/admin/mock-test-manager";
import { PromoManager } from "@/components/admin/promo-manager";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AdminContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

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

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You do not have permission to access the admin panel.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">
              Manage questions, chapters, students, mock tests, subscriptions and promo codes
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto mb-8">
              <TabsList className="grid w-full max-w-4xl grid-cols-6 min-w-[600px]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="chapters">Chapters</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="mocktests">Mock Tests</TabsTrigger>
                <TabsTrigger value="promo">Promo Codes</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <AdminOverview />
            </TabsContent>
            <TabsContent value="questions">
              <QuestionManager />
            </TabsContent>
            <TabsContent value="chapters">
              <ChapterManager />
            </TabsContent>
            <TabsContent value="students">
              <StudentManager />
            </TabsContent>
            <TabsContent value="mocktests">
              <MockTestManager />
            </TabsContent>
            <TabsContent value="promo">
              <PromoManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}