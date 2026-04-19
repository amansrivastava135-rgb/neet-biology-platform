import { supabase } from "@/lib/supabase";

export type TopicPerformance = {
  topic: string;
  correct: number;
  attempted: number;
};

export type TestResult = {
  testId: string;
  testLabel?: string; // test ka naam — "Mock Test 1", "Cell Biology — Set 2" etc
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

function getUserId(): string | null {
  try {
    const storedUser = localStorage.getItem("neet_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.id || null;
    }
  } catch {}
  return null;
}

export async function saveResult(result: TestResult): Promise<void> {
  const userId = getUserId();

  if (userId) {
    try {
      const { data: existing } = await supabase
        .from("test_results")
        .select("id, date, test_type, attempted")
        .eq("user_id", userId)
        .gte("date", new Date(Date.now() - 2000).toISOString());

      const isDuplicate = (existing || []).some(
        (r) =>
          r.test_type === result.testType &&
          r.attempted === result.attempted
      );

      if (!isDuplicate) {
        const { error } = await supabase.from("test_results").insert({
          user_id: userId,
          test_id: result.testId,
          test_label: result.testLabel || null, // naam save karo
          test_type: result.testType || "chapter",
          date: result.date,
          score: result.score,
          total_marks: result.totalMarks,
          correct: result.correct,
          incorrect: result.incorrect,
          unattempted: result.unattempted,
          attempted: result.attempted,
          accuracy: result.accuracy,
          time_taken: result.timeTaken,
          topics: result.topics,
          topic_performance: result.topicPerformance,
        });

        if (error) {
          console.error("Supabase saveResult error:", error);
          saveToLocalStorage(result, userId);
        }
      }
    } catch (err) {
      console.error("saveResult failed, using localStorage:", err);
      saveToLocalStorage(result, userId);
    }
  } else {
    saveToLocalStorage(result, null);
  }
}

export async function getResults(): Promise<TestResult[]> {
  if (typeof window === "undefined") return [];

  const userId = getUserId();

  if (userId) {
    try {
      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((r) => ({
          testId: r.test_id,
          testLabel: r.test_label || null,
          date: r.date,
          testType: r.test_type,
          score: r.score,
          totalMarks: r.total_marks,
          correct: r.correct,
          incorrect: r.incorrect,
          unattempted: r.unattempted,
          attempted: r.attempted,
          accuracy: Number(r.accuracy),
          timeTaken: r.time_taken,
          topics: r.topics || [],
          topicPerformance: r.topic_performance || [],
        }));
      }

      const localResults = getFromLocalStorage(userId);
      if (localResults.length > 0) {
        for (const result of localResults) {
          await saveResult(result);
        }
        clearLocalStorage(userId);
        return localResults;
      }

      return [];
    } catch (err) {
      console.error("getResults Supabase failed, using localStorage:", err);
      return getFromLocalStorage(userId);
    }
  }

  return getFromLocalStorage(null);
}

export async function clearResults(): Promise<void> {
  if (typeof window === "undefined") return;
  const userId = getUserId();
  if (userId) {
    try {
      await supabase.from("test_results").delete().eq("user_id", userId);
    } catch (err) {
      console.error("clearResults error:", err);
    }
    clearLocalStorage(userId);
  }
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

  const topicStats = Object.entries(topicMap).map(
    ([topic, { correct, attempted }]) => ({
      topic,
      accuracy: attempted > 0 ? (correct / attempted) * 100 : 0,
    })
  );

  return { totalTests, avgAccuracy, bestScore, topicStats };
}

function getStorageKey(userId: string | null): string {
  return userId ? `testHistory_${userId}` : "testHistory";
}

function saveToLocalStorage(result: TestResult, userId: string | null): void {
  try {
    const key = getStorageKey(userId);
    const existing = getFromLocalStorage(userId);
    const isDuplicate = existing.some(
      (r) =>
        Math.abs(new Date(r.date).getTime() - new Date(result.date).getTime()) < 2000 &&
        r.testType === result.testType &&
        r.attempted === result.attempted
    );
    if (isDuplicate) return;
    existing.unshift(result);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {}
}

function getFromLocalStorage(userId: string | null): TestResult[] {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as TestResult[];
  } catch {
    return [];
  }
}

function clearLocalStorage(userId: string | null): void {
  try {
    const key = getStorageKey(userId);
    localStorage.removeItem(key);
  } catch {}
}