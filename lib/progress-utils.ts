import { UserProgress } from "@/lib/auth-context";

/**
 * Fetch user progress from Supabase via API
 */
export async function fetchUserProgress(userId: string): Promise<UserProgress> {
  try {
    const response = await fetch(`/api/progress?userId=${userId}`);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        "Failed to fetch progress:",
        response.statusText,
        response.status,
        errorBody
      );
      return { totalAttempted: 0, totalCorrect: 0, chapterProgress: {} };
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return { totalAttempted: 0, totalCorrect: 0, chapterProgress: {} };
  }
}

/**
 * Save user progress to Supabase via API
 */
export async function saveUserProgress(
  userId: string,
  progress: UserProgress
): Promise<boolean> {
  try {
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        totalAttempted: progress.totalAttempted,
        totalCorrect: progress.totalCorrect,
        chapterProgress: progress.chapterProgress,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save progress:", response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving progress:", error);
    return false;
  }
}

/**
 * Update chapter progress and sync with Supabase
 */
export async function updateChapterProgress(
  userId: string,
  chapterId: number,
  isCorrect: boolean,
  currentProgress: UserProgress
): Promise<UserProgress> {
  const updated = { ...currentProgress };

  // Update totals
  updated.totalAttempted += 1;
  if (isCorrect) {
    updated.totalCorrect += 1;
  }

  // Update chapter-specific stats
  if (!updated.chapterProgress[chapterId]) {
    updated.chapterProgress[chapterId] = { attempted: 0, correct: 0 };
  }
  updated.chapterProgress[chapterId].attempted += 1;
  if (isCorrect) {
    updated.chapterProgress[chapterId].correct += 1;
  }

  // Save to Supabase
  await saveUserProgress(userId, updated);

  return updated;
}
