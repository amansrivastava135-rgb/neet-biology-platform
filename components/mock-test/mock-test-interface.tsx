"use client";

import { useMemo } from "react";
import { TestEngine, TestSubmitPayload } from "@/components/test-engine/TestEngine";
import { sampleQuestions, class11Chapters, class12Chapters, type Question } from "@/lib/data";

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

function getAllQuestions(): Question[] {
  let adminQuestions: Question[] = [];
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("neet_admin_questions");
      if (stored) adminQuestions = JSON.parse(stored);
    }
  } catch {}
  return [...adminQuestions, ...sampleQuestions];
}

function getManualMockTest(mockTestId: string): Question[] {
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("neet_manual_mock_tests");
      if (stored) {
        const tests = JSON.parse(stored);
        const test = tests.find((t: any) => t.id === mockTestId);
        if (test) return test.questions;
      }
    }
  } catch {}
  return [];
}

function getQuestionsForMockTest(testType: "full" | "preview", mockTestId?: string): Question[] {
  // Manual mock test
  if (mockTestId) {
    return getManualMockTest(mockTestId);
  }

  const allQuestions = getAllQuestions();

  if (testType === "preview") {
    return shuffleArray(allQuestions).slice(0, 10);
  }

  // Class 11 chapter IDs
  const class11Ids = class11Chapters.map((c) => c.id);
  // Class 12 chapter IDs
  const class12Ids = class12Chapters.map((c) => c.id);

  const class11Questions = allQuestions.filter((q) => class11Ids.includes(q.chapterId));
  const class12Questions = allQuestions.filter((q) => class12Ids.includes(q.chapterId));

  // 45 from Class 11 — balanced across chapters
  const selected11: Question[] = [];
  const questionsPerClass11Chapter = Math.ceil(45 / class11Ids.length);
  class11Ids.forEach((id) => {
    const chapterQs = shuffleArray(class11Questions.filter((q) => q.chapterId === id));
    selected11.push(...chapterQs.slice(0, questionsPerClass11Chapter));
  });

  // 45 from Class 12 — balanced across chapters
  const selected12: Question[] = [];
  const questionsPerClass12Chapter = Math.ceil(45 / class12Ids.length);
  class12Ids.forEach((id) => {
    const chapterQs = shuffleArray(class12Questions.filter((q) => q.chapterId === id));
    selected12.push(...chapterQs.slice(0, questionsPerClass12Chapter));
  });

  // Shuffle and take exactly 45 from each
  const final11 = shuffleArray(selected11).slice(0, 45);
  const final12 = shuffleArray(selected12).slice(0, 45);

  // Combine and shuffle final 90
  return shuffleArray([...final11, ...final12]);
}

export function MockTestInterface({ testType, onSubmit, isPaidUser, mockTestId }: MockTestInterfaceProps) {
  const testSeed = useMemo(() => Date.now(), []);

  const questions = useMemo<Question[]>(
    () => getQuestionsForMockTest(testType, mockTestId),
    [testType, mockTestId, testSeed]
  );

  const totalTime = testType === "full" ? 90 * 60 : 10 * 60;
  const storageKey = mockTestId
    ? `neet-mock-test-manual-${mockTestId}`
    : `neet-mock-test-${testType}`;

  return (
    <TestEngine
      questions={questions}
      totalTime={totalTime}
      storageKey={storageKey}
      onSubmit={onSubmit}
      isPaidUser={isPaidUser}
      testLabel={
        mockTestId
          ? "Custom Mock Test"
          : testType === "full"
          ? "Full Mock Test — 90 Questions (50% Class 11 + 50% Class 12)"
          : "Demo Test"
      }
      initialTestType={testType}
    />
  );
}