"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, Lock, Play, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { getRemainingDays } from "@/lib/subscription-utils";
import { useAuth } from "@/lib/auth-context";
import { sampleQuestions, class11Chapters, class12Chapters } from "@/lib/data";

const QUESTIONS_PER_TEST = 90;

type AutoMockTest = {
  id: string;
  name: string;
  startIndex: number;
  endIndex: number;
  questionCount: number;
};

type ManualMockTest = {
  id: string;
  name: string;
  description: string;
  questions: any[];
  createdAt: string;
  class11Count: number;
  class12Count: number;
};

type MockTestSelectorProps = {
  onStartTest: (type: "full" | "preview", mockTestId?: string, autoTestIndex?: number) => void;
  isPaidUser: boolean;
};

function getTotalAvailableQuestions(): number {
  let adminQuestions: any[] = [];
  try {
    const stored = localStorage.getItem("neet_admin_questions");
    if (stored) adminQuestions = JSON.parse(stored);
  } catch {}
  return adminQuestions.length + sampleQuestions.length;
}

function generateAutoMockTests(): AutoMockTest[] {
  const total = getTotalAvailableQuestions();
  const tests: AutoMockTest[] = [];
  const totalTests = Math.max(1, Math.ceil(total / QUESTIONS_PER_TEST));

  for (let i = 0; i < totalTests; i++) {
    const start = i * QUESTIONS_PER_TEST;
    const end = Math.min(start + QUESTIONS_PER_TEST, total);
    tests.push({
      id: `auto-${i + 1}`,
      name: `Mock Test ${i + 1}`,
      startIndex: start,
      endIndex: end,
      questionCount: end - start,
    });
  }
  return tests;
}

export function MockTestSelector({ onStartTest, isPaidUser }: MockTestSelectorProps) {
  const { user } = useAuth();
  const remainingDays = user ? getRemainingDays(user) : 0;
  const [manualTests, setManualTests] = useState<ManualMockTest[]>([]);
  const [autoTests, setAutoTests] = useState<AutoMockTest[]>([]);

  useEffect(() => {
    // Load manual tests
    try {
      const stored = localStorage.getItem("neet_manual_mock_tests");
      if (stored) setManualTests(JSON.parse(stored));
    } catch {}

    // Generate auto tests based on available questions
    setAutoTests(generateAutoMockTests());
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">NEET Mock Tests</h1>
        <p className="text-muted-foreground">
          Practice with full-length NEET pattern tests to build exam temperament
        </p>
        {isPaidUser && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant="secondary">Premium Active</Badge>
            {remainingDays > 0 && (
              <span className="text-sm text-muted-foreground">
                {remainingDays} days remaining
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
        {/* Demo Test */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Free Preview</Badge>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl mt-4">Demo Mock Test</CardTitle>
            <CardDescription>Get a taste of the NEET exam experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileQuestion className="h-4 w-4" />
                <span>10 Questions</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>10 Minutes</span>
              </div>
            </div>
            <Button className="w-full gap-2" onClick={() => onStartTest("preview")}>
              <Play className="h-4 w-4" />
              Start Demo Test
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-border bg-muted/30">
          <CardHeader>
            <CardTitle className="text-xl">Mock Test Info</CardTitle>
            <CardDescription>How mock tests work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>✅ Each test has <strong>90 questions</strong></p>
            <p>✅ <strong>50% Class 11</strong> + <strong>50% Class 12</strong></p>
            <p>✅ Questions from <strong>all 38 chapters</strong></p>
            <p>✅ New mock test auto-created after every 90 questions added</p>
            <p>✅ <strong>90 minutes</strong> per test</p>
          </CardContent>
        </Card>
      </div>

      {/* Auto Generated Mock Tests */}
      {isPaidUser ? (
        <div className="max-w-4xl mx-auto mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Available Mock Tests
            <Badge variant="secondary" className="ml-2">{autoTests.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {autoTests.map((test, index) => (
              <Card key={test.id} className="border-border hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground">{test.name}</span>
                    <Badge variant="outline">{test.questionCount} Qs</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>90 Minutes</span>
                    <Target className="h-3 w-3 ml-2" />
                    <span>Full Syllabus</span>
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={() => onStartTest("full", undefined, index)}
                  >
                    <Play className="h-4 w-4" />
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto mb-10 p-6 bg-secondary/50 rounded-lg text-center">
          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-2">Unlock Mock Tests with Premium</p>
          <p className="text-muted-foreground text-sm mb-4">
            Get access to all mock tests with detailed analytics
          </p>
          <Button asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      )}

      {/* Manual Mock Tests */}
      {isPaidUser && manualTests.length > 0 && (
        <div className="max-w-4xl mx-auto mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Custom Mock Tests
            <Badge variant="secondary" className="ml-2">{manualTests.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {manualTests.map((test) => (
              <Card key={test.id} className="border-border hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="mb-3">
                    <p className="font-medium text-foreground">{test.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{test.description}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge variant="outline" className="text-xs">{test.questions.length} Qs</Badge>
                    <Badge variant="secondary" className="text-xs">11th: {test.class11Count}</Badge>
                    <Badge variant="secondary" className="text-xs">12th: {test.class12Count}</Badge>
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={() => onStartTest("full", test.id)}
                  >
                    <Play className="h-4 w-4" />
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Test Instructions */}
      <Card className="max-w-4xl mx-auto border-border">
        <CardHeader>
          <CardTitle className="text-lg">Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">1.</span>
              Ensure you have a stable internet connection before starting.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">2.</span>
              Each question has 4 options. Select one option for each question.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">3.</span>
              You can mark questions for review and come back to them later.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">4.</span>
              The test will auto-submit when the timer runs out.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">5.</span>
              Marking scheme: +4 for correct, -1 for incorrect, 0 for unattempted.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}