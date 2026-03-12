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
  const questions = useMemo<Question[]>(
    () => (testType === "full" ? sampleQuestions.slice(0, 180) : sampleQuestions.slice(0, 10)),
    [testType]
  );

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
