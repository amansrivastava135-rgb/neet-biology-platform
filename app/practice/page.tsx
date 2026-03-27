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

  const manualSetQuestions = allQuestions.filter((q: any) => q.setNumber === setNumber);
  if (manualSetQuestions.length > 0) return manualSetQuestions;

  const ncertQuestions = allQuestions.filter((q: any) => !q.setNumber && q.source === "NCERT");
  const pyqQuestions = allQuestions.filter((q: any) => !q.setNumber && q.source === "PYQ");

  const totalNcertSets = Math.ceil(ncertQuestions.length / SET_SIZE);

  if (setNumber === totalNcertSets + 1) {
    return pyqQuestions.slice(0, SET_SIZE);
  }

  const start = (setNumber - 1) * SET_SIZE;
  const result = ncertQuestions.slice(start, start + SET_SIZE);

  if (result.length === 0) {
    const allAutoQuestions = allQuestions.filter((q: any) => !q.setNumber);
    const fallbackStart = (setNumber - 1) * SET_SIZE;
    return allAutoQuestions.slice(fallbackStart, fallbackStart + SET_SIZE);
  }

  return result;
}

// Get all PYQ questions for a specific year across all chapters
function getPYQQuestionsByYear(year: number): Question[] {
  let adminQuestions: Question[] = [];
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("neet_admin_questions");
      if (stored) adminQuestions = JSON.parse(stored);
    }
  } catch {}

  return [...adminQuestions, ...sampleQuestions].filter(
    (q) => q.source === "PYQ" && q.year === year
  );
}

// Get all PYQ questions for a specific chapter
function getPYQQuestionsByChapter(chapterId: number): Question[] {
  let adminQuestions: Question[] = [];
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("neet_admin_questions");
      if (stored) adminQuestions = JSON.parse(stored);
    }
  } catch {}

  return [...adminQuestions, ...sampleQuestions].filter(
    (q) => q.source === "PYQ" && q.chapterId === chapterId
  );
}

type PracticeMode =
  | { type: "none" }
  | { type: "demo" }
  | { type: "chapter"; chapterId: number; setNumber: number }
  | { type: "pyq-year"; year: number }
  | { type: "pyq-chapter"; chapterId: number };

function PracticeContent() {
  const { user } = useAuth();
  const isPaid = isPremium(user);
  const searchParams = useSearchParams();
  const isDemoParam = searchParams.get("demo") === "true";

  const [mode, setMode] = useState<PracticeMode>(
    isDemoParam ? { type: "demo" } : { type: "none" }
  );
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{
    questions: Question[];
    answers: (string | null)[];
    timeTaken: number;
  } | null>(null);

  const { questions, storageKey, testLabel, testType } = useMemo(() => {
    if (mode.type === "none") {
      return { questions: [], storageKey: "", testLabel: "", testType: "practice" };
    }

    if (mode.type === "demo") {
      return {
        questions: getDemoQuestions(),
        storageKey: "neet-practice-demo",
        testLabel: "Demo Practice",
        testType: "preview",
      };
    }

    if (mode.type === "chapter") {
      const qs = getQuestionsForSet(mode.chapterId, mode.setNumber);
      const limited = !isPaid && qs.length > 3 ? qs.slice(0, 3) : qs;
      return {
        questions: limited,
        storageKey: `neet-practice-chapter-${mode.chapterId}-set-${mode.setNumber}`,
        testLabel: `Chapter ${mode.chapterId} — Set ${mode.setNumber}`,
        testType: "practice",
      };
    }

    if (mode.type === "pyq-year") {
      const qs = getPYQQuestionsByYear(mode.year);
      return {
        questions: qs,
        storageKey: `neet-practice-pyq-year-${mode.year}`,
        testLabel: `NEET ${mode.year} — Biology PYQ`,
        testType: "practice",
      };
    }

    if (mode.type === "pyq-chapter") {
      const qs = getPYQQuestionsByChapter(mode.chapterId);
      return {
        questions: qs,
        storageKey: `neet-practice-pyq-chapter-${mode.chapterId}`,
        testLabel: `Chapter ${mode.chapterId} — PYQ Practice`,
        testType: "practice",
      };
    }

    return { questions: [], storageKey: "", testLabel: "", testType: "practice" };
  }, [mode, isPaid]);

  const totalTime = questions.length > 0 ? questions.length * 60 : 0;

  const handleStartChapter = (chapterId: number, setNumber?: number) => {
    setMode({ type: "chapter", chapterId, setNumber: setNumber ?? 1 });
    setShowResult(false);
  };

  const handleStartPYQYear = (year: number) => {
    setMode({ type: "pyq-year", year });
    setShowResult(false);
  };

  const handleStartPYQChapter = (chapterId: number) => {
    setMode({ type: "pyq-chapter", chapterId });
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

  const handleRetake = () => setShowResult(false);

  const handleBackToChapters = () => {
    setMode({ type: "none" });
    setShowResult(false);
  };

  if (mode.type === "none") {
    return (
      <ChapterSelector
        onSelectChapter={handleStartChapter}
        onStartPYQYear={handleStartPYQYear}
        onStartPYQChapter={handleStartPYQChapter}
        onStartDemo={() => {
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