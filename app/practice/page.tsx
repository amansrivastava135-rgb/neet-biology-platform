"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isPremium } from "@/lib/checkPremium";
import { ChapterSelector } from "@/components/practice/chapter-selector";
import { MockTestResult } from "@/components/mock-test/mock-test-result";
import { TestEngine } from "@/components/test-engine/TestEngine";
import { getDemoQuestions, getQuestionsByChapter, sampleQuestions, type Question } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

const SET_SIZE = 90;

function getQuestionsForSet(chapterId: number, setNumber: number): Question[] {
  let adminQuestions: Question[] = [];
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("neet_admin_questions");
      if (stored) adminQuestions = JSON.parse(stored);
    }
  } catch {}

  const allQuestions = [...adminQuestions, ...sampleQuestions].filter(
    (q) => q.chapterId === chapterId
  );

  // Manual set questions
  const manualSetQuestions = allQuestions.filter((q: any) => q.setNumber === setNumber);
  if (manualSetQuestions.length > 0) return manualSetQuestions;

  // Separate PYQ and NCERT questions — NO overlap
  const ncertQuestions = allQuestions.filter((q: any) => !q.setNumber && q.source === "NCERT");
  const pyqQuestions = allQuestions.filter((q: any) => !q.setNumber && q.source === "PYQ");

  const totalNcertSets = Math.ceil(ncertQuestions.length / SET_SIZE);

  // PYQ Set is always the LAST set
  if (setNumber === totalNcertSets + 1) {
    return pyqQuestions.slice(0, SET_SIZE);
  }

  // NCERT auto sets — no overlap
  const start = (setNumber - 1) * SET_SIZE;
  const result = ncertQuestions.slice(start, start + SET_SIZE);
  
  // If no NCERT questions, fallback to all questions for this set
  if (result.length === 0) {
    const allAutoQuestions = allQuestions.filter((q: any) => !q.setNumber);
    const fallbackStart = (setNumber - 1) * SET_SIZE;
    return allAutoQuestions.slice(fallbackStart, fallbackStart + SET_SIZE);
  }
  
  return result;
}

function PracticeContent() {
  const { user } = useAuth();
  const isPaid = isPremium(user);
  const searchParams = useSearchParams();
  const isDemoParam = searchParams.get("demo") === "true";

  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{
    questions: Question[];
    answers: (string | null)[];
    timeTaken: number;
  } | null>(null);

  const showingDemo = isDemoParam || (!user && selectedChapter === null);

  const questions = useMemo(() => {
    if (showingDemo) return getDemoQuestions();
    if (selectedChapter && selectedSet !== null) {
      const qs = getQuestionsForSet(selectedChapter, selectedSet);
      if (!isPaid && qs.length > 3) return qs.slice(0, 3);
      return qs;
    }
    return [];
  }, [selectedChapter, selectedSet, showingDemo, isPaid]);

  const totalTime = showingDemo ? 10 * 60 : questions.length > 0 ? questions.length * 60 : 0;
  const storageKey = showingDemo
    ? "neet-practice-demo"
    : `neet-practice-chapter-${selectedChapter}-set-${selectedSet}`;
  const testLabel = showingDemo
    ? "Demo Practice"
    : `Chapter ${selectedChapter} — Set ${selectedSet}`;
  const testType = showingDemo ? "preview" : "practice";

  const handleStartChapter = (chapterId: number, setNumber?: number) => {
    setSelectedChapter(chapterId);
    setSelectedSet(setNumber ?? 1);
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
    setSelectedSet(null);
    setShowResult(false);
  };

  if (!selectedChapter && !showingDemo) {
    return (
      <ChapterSelector
        onSelectChapter={handleStartChapter}
        onStartDemo={() => {
          setSelectedChapter(null);
          setSelectedSet(null);
          setShowResult(false);
          const url = new URL(window.location.href);
          url.searchParams.set("demo", "true");
          window.location.href = url.toString();
        }}
        isPaidUser={isPaid}
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

      {questions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">
            No questions available for this set yet.
          </p>
          <Button variant="outline" onClick={handleBackToChapters}>
            Back to Chapters
          </Button>
        </div>
      ) : (
        <TestEngine
          questions={questions}
          totalTime={totalTime}
          storageKey={storageKey}
          onSubmit={handleSubmit}
          isPaidUser={isPaid}
          testLabel={testLabel}
          initialTestType={testType}
        />
      )}
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