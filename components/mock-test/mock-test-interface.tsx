"use client";

import { useEffect, useState } from "react";
import { TestEngine, TestSubmitPayload } from "@/components/test-engine/TestEngine";
import { class11Chapters, class12Chapters, type Question } from "@/lib/data";
import { supabase } from "@/lib/supabase";

type MockTestInterfaceProps = {
  testType: "full" | "preview";
  onSubmit: (payload: TestSubmitPayload) => void;
  isPaidUser: boolean;
  mockTestId?: string;
  autoTestIndex?: number;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function convertToQuestion(q: any): Question {
  return {
    id: q.id,
    question: q.question,
    options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    chapterId: q.chapter_id,
    chapterName: q.chapter_name,
    source: q.source,
    year: q.year,
  };
}

export function MockTestInterface({
  testType,
  onSubmit,
  isPaidUser,
  mockTestId,
  autoTestIndex,
}: MockTestInterfaceProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testLabel, setTestLabel] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      setIsLoading(true);

      // Specific mock test from Supabase — naam wahan se lo
      if (mockTestId) {
        const { data: mockTest } = await supabase
          .from("mock_tests")
          .select("*")
          .eq("id", mockTestId)
          .single();

        if (mockTest && mockTest.question_ids?.length > 0) {
          const { data: qs } = await supabase
            .from("questions")
            .select("*")
            .in("id", mockTest.question_ids);

          if (qs) {
            setQuestions(qs.map(convertToQuestion));
            // Exact naam jo admin ne rakha hai — MOCK 1, MOCK 2 etc
            setTestLabel(mockTest.name);
          }
        }
        setIsLoading(false);
        return;
      }

      // Demo test
      if (testType === "preview") {
        const { data } = await supabase
          .from("questions")
          .select("*")
          .limit(100);

        if (data) {
          const shuffled = shuffleArray(data).slice(0, 10);
          setQuestions(shuffled.map(convertToQuestion));
          setTestLabel("Demo Test");
        }
        setIsLoading(false);
        return;
      }

      // Full auto mock test
      const class11Ids = class11Chapters.map((c) => c.id);
      const class12Ids = class12Chapters.map((c) => c.id);

      const { data: class11Data } = await supabase
        .from("questions")
        .select("*")
        .in("chapter_id", class11Ids);

      const { data: class12Data } = await supabase
        .from("questions")
        .select("*")
        .in("chapter_id", class12Ids);

      const class11Questions = class11Data || [];
      const class12Questions = class12Data || [];

      const selected11: any[] = [];
      const perChapter11 = Math.ceil(45 / class11Ids.length);
      class11Ids.forEach((id) => {
        const chapterQs = shuffleArray(class11Questions.filter((q) => q.chapter_id === id));
        selected11.push(...chapterQs.slice(0, perChapter11));
      });

      const selected12: any[] = [];
      const perChapter12 = Math.ceil(45 / class12Ids.length);
      class12Ids.forEach((id) => {
        const chapterQs = shuffleArray(class12Questions.filter((q) => q.chapter_id === id));
        selected12.push(...chapterQs.slice(0, perChapter12));
      });

      const final11 = shuffleArray(selected11).slice(0, 45);
      const final12 = shuffleArray(selected12).slice(0, 45);
      const finalQuestions = shuffleArray([...final11, ...final12]);

      setQuestions(finalQuestions.map(convertToQuestion));
      setTestLabel("Full Mock Test");
      setIsLoading(false);
    }

    loadQuestions();
  }, [testType, mockTestId, autoTestIndex]);

  const totalTime = testType === "full" ? 90 * 60 : 10 * 60;
  const storageKey = mockTestId
  ? `neet-mock-${mockTestId}-${Date.now()}`
  : `neet-mock-${testType}-${Date.now()}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">No questions available.</p>
          <p className="text-sm text-muted-foreground">
            Please ask admin to add questions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TestEngine
      questions={questions}
      totalTime={totalTime}
      storageKey={storageKey}
      onSubmit={onSubmit}
      isPaidUser={isPaidUser}
      testLabel={testLabel}
      initialTestType={testType === "full" ? "full" : "preview"}
    />
  );
}