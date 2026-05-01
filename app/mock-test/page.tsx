"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { isPremium, isTrial } from "@/lib/checkPremium";
import { MockTestSelector } from "@/components/mock-test/mock-test-selector";
import { MockTestInterface } from "@/components/mock-test/mock-test-interface";
import { MockTestResult } from "@/components/mock-test/mock-test-result";
import { ErrorBoundary } from "@/components/error-boundary";
import { type Question } from "@/lib/data";
import { supabase } from "@/lib/supabase";

export type MockTestState = "selection" | "test" | "result";
export type MockTestAnswer = string | null;

type MockTestResultData = {
  questions: Question[];
  answers: MockTestAnswer[];
  timeTaken: number;
  testLabel: string;
};

function MockTestContentWrapper({ onTestStateChange }: { onTestStateChange: (inTest: boolean) => void }) {
  const { user } = useAuth();
  const isPaid = isPremium(user);
  const isTrialUser = isTrial(user);
  const [testState, setTestState] = useState<MockTestState>("selection");
  const [testType, setTestType] = useState<"full" | "preview">("preview");
  const [mockTestId, setMockTestId] = useState<string | undefined>(undefined);
  const [autoTestIndex, setAutoTestIndex] = useState<number | undefined>(undefined);
  const [resultData, setResultData] = useState<MockTestResultData | null>(null);
  const [testLabel, setTestLabel] = useState("Demo Test");

  const handleStartTest = async (
    type: "full" | "preview",
    manualTestId?: string,
    autoIndex?: number
  ) => {
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

    if (manualTestId) {
      const { data: mockTest } = await supabase
        .from("mock_tests")
        .select("name")
        .eq("id", manualTestId)
        .single();
      setTestLabel(mockTest?.name || "Mock Test");
    } else if (type === "preview") {
      setTestLabel("Demo Test");
    } else {
      setTestLabel("Full Mock Test");
    }
  };

  const handleSubmitTest = (data: { questions: Question[]; answers: MockTestAnswer[]; timeTaken: number }) => {
    setResultData({ ...data, testLabel });
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
        <MockTestSelector
          onStartTest={handleStartTest}
          isPaidUser={isPaid}
          isTrial={isTrialUser}
        />
      )}
      {testState === "test" && (
        <ErrorBoundary fallback={
          <div className="p-8 text-center">
            <p className="text-red-500 font-medium">Test failed to load!</p>
            <button
              className="mt-3 text-sm text-primary underline"
              onClick={handleRetakeTest}
            >
              Go back
            </button>
          </div>
        }>
          <MockTestInterface
            testType={testType}
            onSubmit={handleSubmitTest}
            isPaidUser={isPaid}
            mockTestId={mockTestId}
            autoTestIndex={autoTestIndex}
          />
        </ErrorBoundary>
      )}
      {testState === "result" && resultData && (
        <MockTestResult
          questions={resultData.questions}
          answers={resultData.answers}
          timeTaken={resultData.timeTaken}
          testType={testType}
          testLabel={resultData.testLabel}
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