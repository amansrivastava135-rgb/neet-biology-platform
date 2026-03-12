export type TopicPerformance = {
  topic: string;
  correct: number;
  attempted: number;
};

export type TestResult = {
  testId: string;
  date: string;
  testType?: string; // e.g. 'full', 'preview', 'practice', etc.
  score: number;
  totalMarks: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  attempted: number;
  accuracy: number;
  timeTaken: number;
  topics: string[];
  topicPerformance: TopicPerformance[];
};

const STORAGE_KEY = "testHistory";

export function saveResult(result: TestResult) {
  try {
    const existing = getResults();
    existing.unshift(result); // latest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

export function getResults(): TestResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TestResult[];
  } catch {
    return [];
  }
}

export function clearResults() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// summary
export function summarize(results: TestResult[]) {
  const totalTests = results.length;
  const avgAccuracy =
    totalTests > 0
      ?
          Math.round(
            results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests
          )
      : 0;
  const bestScore =
    results.reduce((max, r) => (r.score > max ? r.score : max), 0);

  // aggregate topic performance
  const topicMap: Record<string, { correct: number; attempted: number }> = {};
  results.forEach((r) => {
    r.topicPerformance.forEach(({ topic, correct, attempted }) => {
      if (!topicMap[topic]) topicMap[topic] = { correct: 0, attempted: 0 };
      topicMap[topic].correct += correct;
      topicMap[topic].attempted += attempted;
    });
  });

  const topicStats = Object.entries(topicMap).map(([topic, { correct, attempted }]) => ({
    topic,
    accuracy: attempted > 0 ? (correct / attempted) * 100 : 0,
  }));

  return { totalTests, avgAccuracy, bestScore, topicStats };
}
