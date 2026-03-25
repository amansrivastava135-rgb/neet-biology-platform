"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { MockTestSelector } from "@/components/mock-test/mock-test-selector";
import { MockTestInterface } from "@/components/mock-test/mock-test-interface";
import { MockTestResult } from "@/components/mock-test/mock-test-result";
import { type Question } from "@/lib/data";

export type MockTestState = "selection" | "test" | "result";
export type MockTestAnswer = string | null;

type MockTestResultData = {
  questions: Question[];
  answers: MockTestAnswer[];
  timeTaken: number;
};

function MockTestContentWrapper({ onTestStateChange }: { onTestStateChange: (inTest: boolean) => void }) {
  const { user } = useAuth();
  const isPaid = user?.isPaid ?? false;
  const [testState, setTestState] = useState<MockTestState>("selection");
  const [testType, setTestType] = useState<"full" | "preview">("preview");
  const [mockTestId, setMockTestId] = useState<string | undefined>(undefined);
  const [autoTestIndex, setAutoTestIndex] = useState<number | undefined>(undefined);
  const [resultData, setResultData] = useState<MockTestResultData | null>(null);
  const [testLabel, setTestLabel] = useState("Demo Test");

  const handleStartTest = (type: "full" | "preview", manualTestId?: string, autoIndex?: number) => {
    if (type === "full" && !isPaid) {
      window.location.href = "/pricing";
      return;
    }
    setTestType(type);
    setMockTestId(manualTestId);
    setAutoTestIndex(autoIndex);
    setResultData(null);
    setTestState("test");
    onTestStateChange(true);

    // Set label
    if (manualTestId) {
      setTestLabel("Custom Mock Test");
    } else if (autoIndex !== undefined) {
      setTestLabel(`Mock Test ${autoIndex + 1}`);
    } else {
      setTestLabel("Demo Test");
    }
  };

  const handleSubmitTest = (data: MockTestResultData) => {
    setResultData(data);
    setTestState("result");
    onTestStateChange(false);
  };

  const handleRetakeTest = () => {
    setTestState("selection");
    setResultData(null);
    setMockTestId(undefined);
    setAutoTestIndex(undefined);
    onTestStateChange(false);
  };

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
          mockTestId={mockTestId}
          autoTestIndex={autoTestIndex}
        />
      )}
      {testState === "result" && resultData && (
        <MockTestResult
          questions={resultData.questions}
          answers={resultData.answers}
          timeTaken={resultData.timeTaken}
          testType={testType}
          testLabel={testLabel}
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

export default function MockTestPageWrapper() {
  return (
    <AuthProvider>
      <MockTestPage />
    </AuthProvider>
  );
}