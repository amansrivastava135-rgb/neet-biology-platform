export type TopicPerformance = {
  topic: string;
  correct: number;
  attempted: number;
};

export type TestResult = {
  testId: string;
  date: string;
  testType?: string;
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

// Per-user storage key
function getStorageKey(): string {
  try {
    const storedUser = localStorage.getItem("neet_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return `testHistory_${user.id}`;
    }
  } catch {}
  return "testHistory";
}

export function saveResult(result: TestResult) {
  try {
    const key = getStorageKey();
    const existing = getResults();
    // Prevent duplicate entries within 2 seconds
    const isDuplicate = existing.some(
      (r) => Math.abs(new Date(r.date).getTime() - new Date(result.date).getTime()) < 2000
        && r.testType === result.testType
        && r.attempted === result.attempted
    );
    if (isDuplicate) return;
    existing.unshift(result);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {}
}

export function getResults(): TestResult[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as TestResult[];
  } catch {
    return [];
  }
}

export function clearResults() {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey();
    localStorage.removeItem(key);
  } catch {}
}

export function summarize(results: TestResult[]) {
  const totalTests = results.length;
  const avgAccuracy =
    totalTests > 0
      ? Math.round(results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests)
      : 0;
  const bestScore = results.reduce((max, r) => (r.score > max ? r.score : max), 0);

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