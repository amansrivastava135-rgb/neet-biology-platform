"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { MockTestSelector } from "@/components/mock-test/mock-test-selector";
import { MockTestInterface } from "@/components/mock-test/mock-test-interface";
import { MockTestResult } from "@/components/mock-test/mock-test-result";

export type MockTestState = "selection" | "test" | "result";

export type MockTestAnswer = {
  questionId: number;
  selectedOption: string | null;
  isMarkedForReview: boolean;
};

function MockTestContent() {
  const { user } = useAuth();
  const [testState, setTestState] = useState<MockTestState>("selection");
  const [answers, setAnswers] = useState<MockTestAnswer[]>([]);
  const [testType, setTestType] = useState<"full" | "preview">("preview");

  const handleStartTest = (type: "full" | "preview") => {
    setTestType(type);
    setAnswers([]);
    setTestState("test");
  };

  const handleSubmitTest = (finalAnswers: MockTestAnswer[]) => {
    setAnswers(finalAnswers);
    setTestState("result");
  };

  const handleRetakeTest = () => {
    setTestState("selection");
    setAnswers([]);
  };

  const isPaid = user?.isPaid || false;

  return (
    <>
      {testState === "selection" && (
        <MockTestSelector onStartTest={handleStartTest} isPaidUser={isPaid} />
      )}
      {testState === "test" && (
        <MockTestInterface
          testType={testType}
          onSubmit={handleSubmitTest}
          isPaidUser={isPaid}
        />
      )}
      {testState === "result" && (
        <MockTestResult
          answers={answers}
          testType={testType}
          onRetake={handleRetakeTest}
        />
      )}
    </>
  );
}

function MockTestPage() {
  const [isInTest, setIsInTest] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isInTest && <Header />}
      <main className="flex-1">
        <MockTestContentWrapper onTestStateChange={setIsInTest} />
      </main>
      {!isInTest && <Footer />}
    </div>
  );
}

function MockTestContentWrapper({ onTestStateChange }: { onTestStateChange: (inTest: boolean) => void }) {
  const { user } = useAuth();
  const [testState, setTestState] = useState<MockTestState>("selection");
  const [answers, setAnswers] = useState<MockTestAnswer[]>([]);
  const [testType, setTestType] = useState<"full" | "preview">("preview");

  const handleStartTest = (type: "full" | "preview") => {
    setTestType(type);
    setAnswers([]);
    setTestState("test");
    onTestStateChange(true);
  };

  const handleSubmitTest = (finalAnswers: MockTestAnswer[]) => {
    setAnswers(finalAnswers);
    setTestState("result");
    onTestStateChange(false);
  };

  const handleRetakeTest = () => {
    setTestState("selection");
    setAnswers([]);
    onTestStateChange(false);
  };

  const isPaid = user?.isPaid || false;

  return (
    <>
      {testState === "selection" && (
        <MockTestSelector onStartTest={handleStartTest} isPaidUser={isPaid} />
      )}
      {testState === "test" && (
        <MockTestInterface
          testType={testType}
          onSubmit={handleSubmitTest}
          isPaidUser={isPaid}
        />
      )}
      {testState === "result" && (
        <MockTestResult
          answers={answers}
          testType={testType}
          onRetake={handleRetakeTest}
        />
      )}
    </>
  );
}

export default function MockTestPageWrapper() {
  return (
    <AuthProvider>
      <MockTestPage />
    </AuthProvider>
  );
}
