"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ChapterSelector } from "@/components/practice/chapter-selector";
import { MockTestResult } from "@/components/mock-test/mock-test-result";
import { TestEngine } from "@/components/test-engine/TestEngine";
import { getDemoQuestions, getQuestionsByChapter, type Question } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

function PracticeContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isDemoParam = searchParams.get("demo") === "true";

  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{
    questions: Question[];
    answers: (string | null)[];
    timeTaken: number;
  } | null>(null);

  const showingDemo = isDemoParam || (!user && selectedChapter === null);

  const questions = useMemo(() => {
    if (showingDemo) return getDemoQuestions();
    if (selectedChapter) {
      const qs = getQuestionsByChapter(selectedChapter);
      if (!user?.isPaid && qs.length > 3) return qs.slice(0, 3);
      return qs;
    }
    return [];
  }, [selectedChapter, showingDemo, user]);

  // allocate 1 minute per question for practice/chapter tests
  const totalTime = showingDemo ? 10 * 60 : questions.length > 0 ? questions.length * 60 : 0;
  const storageKey = showingDemo ? "neet-practice-demo" : `neet-practice-chapter-${selectedChapter}`;
  const testLabel = showingDemo ? "Demo Practice" : `Chapter ${selectedChapter} Practice`;
  const testType = showingDemo ? "preview" : "practice";

  const handleStartChapter = (chapterId: number) => {
    setSelectedChapter(chapterId);
    setShowResult(false);
  };

  const handleSubmit = (payload: {
    questions: Question[];
    answers: (string | null)[];
    timeTaken: number;
  }) => {
    setResultData(payload);
    setShowResult(true);
  };

  const handleRetake = () => {
    setShowResult(false);
  };

  const handleBackToChapters = () => {
    setSelectedChapter(null);
    setShowResult(false);
  };

  if (!selectedChapter && !showingDemo) {
    return (
      <ChapterSelector
        onSelectChapter={handleStartChapter}
        onStartDemo={() => {
          setSelectedChapter(null);
          setShowResult(false);
          // preserve query param
          const url = new URL(window.location.href);
          url.searchParams.set("demo", "true");
          window.location.href = url.toString();
        }}
        isPaidUser={user?.isPaid || false}
      />
    );
  }

  if (showResult && resultData) {
    return (
      <MockTestResult
        questions={resultData.questions}
        answers={resultData.answers}
        timeTaken={resultData.timeTaken}
        testType={testType as any}
        testLabel={testLabel}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBackToChapters} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Chapters
        </Button>
      </div>

      <TestEngine
        questions={questions}
        totalTime={totalTime}
        storageKey={storageKey}
        onSubmit={handleSubmit}
        isPaidUser={user?.isPaid || false}
        testLabel={testLabel}
        initialTestType={testType}
      />
    </div>
  );
}

function PracticePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
          <PracticeContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function PracticePageWrapper() {
  return (
    <AuthProvider>
      <PracticePage />
    </AuthProvider>
  );
}
