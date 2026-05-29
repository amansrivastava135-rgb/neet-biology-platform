"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isPremium, isTrial } from "@/lib/checkPremium";
import { ChapterSelector } from "@/components/practice/chapter-selector";
import { MockTestResult } from "@/components/mock-test/mock-test-result";
import { TestEngine } from "@/components/test-engine/TestEngine";
import { getDemoQuestions, type Question } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Suspense } from "react";

type PracticeMode =
  | { type: "none" }
  | { type: "demo" }
  | { type: "chapter"; chapterId: number; setNumber: number }
  | { type: "pyq-year"; year: number }
  | { type: "pyq-chapter"; chapterId: number };

function PracticeContent() {
  const { user } = useAuth();
  const isPaid = isPremium(user);
  const isTrialUser = isTrial(user);
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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [testLabel, setTestLabel] = useState("");
  const [storageKey, setStorageKey] = useState("");
  const [testType, setTestType] = useState("practice");

  useEffect(() => {
    if (mode.type === "none") return;
    if (mode.type === "demo") {
      setQuestions(getDemoQuestions().map(q => ({ ...q, options: q.options })));
      setTestLabel("Demo Practice");
      setStorageKey("neet-practice-demo");
      setTestType("preview");
      return;
    }

    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        if (mode.type === "chapter") {
          const res = await fetch(
            `/api/questions?chapterId=${mode.chapterId}&setNumber=${mode.setNumber}`,
            { credentials: "include" }
          );
          const data = await res.json();
          const converted: Question[] = (data.questions || []).map((q: any) => ({
            id: q.id,
            question: q.question,
            options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            chapterId: q.chapter_id,
            chapterName: q.chapter_name,
            source: q.source,
            year: q.year,
          }));
          const limited = !isPaid && converted.length > 3
            ? converted.slice(0, 3)
            : converted;
          setQuestions(limited);
          setTestLabel(`Chapter ${mode.chapterId} — Set ${mode.setNumber}`);
          setStorageKey(`neet-practice-chapter-${mode.chapterId}-set-${mode.setNumber}`);
          setTestType("practice");
        }
        if (mode.type === "pyq-year") {
          const res = await fetch(
            `/api/questions?source=PYQ&year=${mode.year}`,
            { credentials: "include" }
          );
          const data = await res.json();
          const converted: Question[] = (data.questions || []).map((q: any) => ({
            id: q.id,
            question: q.question,
            options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            chapterId: q.chapter_id,
            chapterName: q.chapter_name,
            source: q.source,
            year: q.year,
          }));
          setQuestions(converted);
          setTestLabel(`NEET ${mode.year} — Biology PYQ`);
          setStorageKey(`neet-practice-pyq-year-${mode.year}`);
          setTestType("practice");
        }
        if (mode.type === "pyq-chapter") {
          const res = await fetch(
            `/api/questions?chapterId=${mode.chapterId}&source=PYQ`,
            { credentials: "include" }
          );
          const data = await res.json();
          const converted: Question[] = (data.questions || []).map((q: any) => ({
            id: q.id,
            question: q.question,
            options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            chapterId: q.chapter_id,
            chapterName: q.chapter_name,
            source: q.source,
            year: q.year,
          }));
          setQuestions(converted);
          setTestLabel(`Chapter ${mode.chapterId} — PYQ Practice`);
          setStorageKey(`neet-practice-pyq-chapter-${mode.chapterId}`);
          setTestType("practice");
        }
      } catch (err) {
        console.error("Questions fetch error:", err);
        setQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
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
    setQuestions([]);
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
        isTrial={isTrialUser}
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
      {isLoadingQuestions ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading questions...</span>
        </div>
      ) : questions.length === 0 ? (
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
        <Suspense fallback={
          <div className="container mx-auto px-4 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          </div>
        }>
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
