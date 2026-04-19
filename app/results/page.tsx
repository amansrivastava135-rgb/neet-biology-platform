"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy, Target, Clock, CheckCircle, XCircle,
  MinusCircle, ChevronDown, ChevronUp, BookOpen,
  FileText, Loader2, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getResults, TestResult } from "@/lib/analytics";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getGrade(accuracy: number): { grade: string; color: string } {
  if (accuracy >= 90) return { grade: "Excellent", color: "text-green-600" };
  if (accuracy >= 75) return { grade: "Very Good", color: "text-blue-600" };
  if (accuracy >= 50) return { grade: "Good", color: "text-yellow-600" };
  if (accuracy >= 30) return { grade: "Average", color: "text-orange-600" };
  return { grade: "Needs Improvement", color: "text-red-600" };
}

function ResultCard({ result, index }: { result: TestResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { grade, color } = getGrade(result.accuracy);
  const isFullTest = result.testType === "full";

  // Test naam determine karo
  const testName = result.testLabel ||
    (isFullTest ? "Full Mock Test" :
    result.testType === "preview" ? "Demo Test" :
    result.topics && result.topics.length === 1 ? result.topics[0] :
    result.topics && result.topics.length > 0 ? `${result.topics[0]} +${result.topics.length - 1} chapters` :
    "Chapter Practice");

  return (
    <Card className="border-border">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={isFullTest ? "default" : "secondary"}>
                {isFullTest ? "Mock Test" : "Chapter Practice"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(result.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(result.date).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Test Name — clearly visible */}
            <p className="text-sm font-semibold text-foreground mb-2">
              {testName}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {result.score}/{result.totalMarks}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-blue-500" />
                <span className={`text-sm font-medium ${color}`}>
                  {result.accuracy}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-foreground">{result.correct}</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-foreground">{result.incorrect}</span>
              </div>
              <div className="flex items-center gap-1">
                <MinusCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{result.unattempted}</span>
              </div>
              {result.timeTaken > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatTime(result.timeTaken)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`text-sm font-semibold ${color}`}>{grade}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-7 px-2"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {expanded && result.topicPerformance && result.topicPerformance.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-3">
              Chapter-wise Performance
            </p>
            <div className="space-y-2">
              {result.topicPerformance
                .sort((a, b) => {
                  const accA = a.attempted > 0 ? a.correct / a.attempted : 0;
                  const accB = b.attempted > 0 ? b.correct / b.attempted : 0;
                  return accA - accB;
                })
                .map((tp) => {
                  const acc = tp.attempted > 0
                    ? Math.round((tp.correct / tp.attempted) * 100)
                    : 0;
                  return (
                    <div key={tp.topic} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground flex-1 truncate">
                        {tp.topic}
                      </span>
                      <span className="text-xs text-foreground whitespace-nowrap">
                        {tp.correct}/{tp.attempted}
                      </span>
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            acc >= 70 ? "bg-green-500" :
                            acc >= 40 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${acc}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium w-8 text-right ${
                        acc >= 70 ? "text-green-600" :
                        acc >= 40 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {acc}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResultsContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getResults()
        .then((data) => setResults(data))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const mockResults = results.filter((r) => r.testType === "full");
  const practiceResults = results.filter(
    (r) => r.testType !== "full" && r.testType !== "preview"
  );

  // Summary stats
  const totalTests = results.length;
  const avgAccuracy = totalTests > 0
    ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / totalTests)
    : 0;
  const bestScore = results.reduce((max, r) => Math.max(max, r.score), 0);
  const totalCorrect = results.reduce((s, r) => s + r.correct, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">

          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/mock-test">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Result History</h1>
              <p className="text-muted-foreground mt-1">
                All your test attempts in one place
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          {totalTests > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{totalTests}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Tests</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <p className={`text-2xl font-bold ${getGrade(avgAccuracy).color}`}>
                    {avgAccuracy}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Avg Accuracy</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{bestScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">Best Score</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{totalCorrect}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Correct</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="mock">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="mock" className="gap-2">
                <FileText className="h-4 w-4" />
                Mock Test Results
                {mockResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {mockResults.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="practice" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Chapter Practice
                {practiceResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {practiceResults.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Mock Test Results */}
            <TabsContent value="mock">
              {mockResults.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">
                      No mock test results yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Attempt a mock test to see your results here
                    </p>
                    <Button asChild>
                      <Link href="/mock-test">Start a Mock Test</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {mockResults.map((result, index) => (
                    <ResultCard key={`mock-${index}`} result={result} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Chapter Practice Results */}
            <TabsContent value="practice">
              {practiceResults.length === 0 ? (
                <Card className="border-border">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">
                      No chapter practice results yet
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Practice chapters to see your results here
                    </p>
                    <Button asChild>
                      <Link href="/practice">Start Practicing</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {practiceResults.map((result, index) => (
                    <ResultCard key={`practice-${index}`} result={result} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <AuthProvider>
      <ResultsContent />
    </AuthProvider>
  );
}