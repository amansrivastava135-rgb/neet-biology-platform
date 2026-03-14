"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { MockTestSelector } from "@/components/mock-test/mock-test-selector";
import { MockTestInterface } from "@/components/mock-test/mock-test-interface";
import { MockTestResult, type MockTestResultProps } from "@/components/mock-test/mock-test-result";
import { PremiumGuard } from "@/components/premium-guard";
import { type Question } from "@/lib/data";

export type MockTestState = "selection" | "test" | "result";

export type MockTestAnswer = string | null;

type MockTestResultData = {
  questions: Question[];
  answers: MockTestAnswer[];
  timeTaken: number;
};

function MockTestContent() {
  const { user } = useAuth();
  const isPaid = user?.isPaid ?? false;
  const [testState, setTestState] = useState<MockTestState>("selection");
  const [testType, setTestType] = useState<"full" | "preview">("preview");
  const [resultData, setResultData] = useState<MockTestResultData | null>(null);

  const handleStartTest = (type: "full" | "preview") => {
    if (type === "full" && !isPaid) {
      // redirect free user to pricing page
      window.location.href = "/pricing";
      return;
    }
    setTestType(type);
    setResultData(null);
    setTestState("test");
  };

  const handleSubmitTest = (data: MockTestResultData) => {
    setResultData(data);
    setTestState("result");
  };

  const handleRetakeTest = () => {
    setTestState("selection");
    setResultData(null);
  };

  const label = testType === "full" ? "Full Mock Test" : "Demo Test";

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
      {testState === "result" && resultData && (
        <MockTestResult
          questions={resultData.questions}
          answers={resultData.answers}
          timeTaken={resultData.timeTaken}
          testType={testType}
          testLabel={label}
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
  const isPaid = user?.isPaid ?? false;
  const [testState, setTestState] = useState<MockTestState>("selection");
  const [testType, setTestType] = useState<"full" | "preview">("preview");
  const [resultData, setResultData] = useState<MockTestResultData | null>(null);

  const handleStartTest = (type: "full" | "preview") => {
    if (type === "full" && !isPaid) {
      window.location.href = "/pricing";
      return;
    }
    setTestType(type);
    setResultData(null);
    setTestState("test");
    onTestStateChange(true);
  };

  const handleSubmitTest = (data: MockTestResultData) => {
    setResultData(data);
    setTestState("result");
    onTestStateChange(false);
  };

  const handleRetakeTest = () => {
    setTestState("selection");
    setResultData(null);
    onTestStateChange(false);
  };

  const label = testType === "full" ? "Full Mock Test" : "Demo Test";

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
      {testState === "result" && resultData && (
        <MockTestResult
          questions={resultData.questions}
          answers={resultData.answers}
          timeTaken={resultData.timeTaken}
          testType={testType}
          testLabel={label}
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

