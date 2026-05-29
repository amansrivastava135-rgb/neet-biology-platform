"use client";

import { ResultPage, ResultPageProps } from "@/components/test-engine/ResultPage";

// re-export types for convenience
export type MockTestResultProps = ResultPageProps;

export function MockTestResult(props: MockTestResultProps) {
  return <ResultPage {...props} />;
}
