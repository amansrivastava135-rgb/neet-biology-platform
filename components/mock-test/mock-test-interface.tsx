"use client";

import { useMemo } from "react";
import { TestEngine, TestSubmitPayload } from "@/components/test-engine/TestEngine";
import { sampleQuestions, type Question } from "@/lib/data";

type MockTestInterfaceProps = {
  testType: "full" | "preview";
  onSubmit: (payload: TestSubmitPayload) => void;
  isPaidUser: boolean;
};

export function MockTestInterface({ testType, onSubmit, isPaidUser }: MockTestInterfaceProps) {
  const questions = useMemo<Question[]>(() => {
    // Admin questions load karo
    let adminQuestions: Question[] = [];
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("neet_admin_questions");
        if (stored) {
          adminQuestions = JSON.parse(stored);
        }
      }
    } catch {}

    // Admin questions hain toh unhe use karo, warna sampleQuestions
    const allQuestions = adminQuestions.length > 0
      ? [...adminQuestions, ...sampleQuestions]
      : sampleQuestions;

    // Shuffle karo
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);

    return testType === "full"
      ? shuffled.slice(0, Math.min(180, shuffled.length))
      : shuffled.slice(0, Math.min(10, shuffled.length));
  }, [testType]);

  const totalTime = testType === "full" ? 180 * 60 : 10 * 60;
  const storageKey = `neet-mock-test-${testType}`;

  return (
    <TestEngine
      questions={questions}
      totalTime={totalTime}
      storageKey={storageKey}
      onSubmit={onSubmit}
      isPaidUser={isPaidUser}
      testLabel={testType === "full" ? "Full Mock Test" : "Demo Test"}
      initialTestType={testType}
    />
  );
}