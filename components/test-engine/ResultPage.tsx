"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Question } from "@/lib/data";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  Trophy,
  Target,
  Clock,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { saveResult, TestResult } from "@/lib/analytics";

export type ResultPageProps = {
  questions: Question[];
  answers: (string | null)[];
  timeTaken: number;
  testType: string;
  testLabel?: string;
  onRetake: () => void;
};

export function ResultPage({
  questions,
  answers,
  timeTaken,
  testType,
  testLabel,
  onRetake,
}: ResultPageProps) {
  const savedRef = useRef(false);
  const totalQuestions = questions.length;
  const [visibleCount, setVisibleCount] = useState(5);

  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  questions.forEach((question, index) => {
    const userAnswer = answers[index];
    if (userAnswer === null) {
      unattemptedCount++;
    } else if (userAnswer === question.correctAnswer) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });

  const attemptedCount = answers.filter((answer) => answer !== null).length;
  const totalMarks = totalQuestions * 4;
  const score = correctCount * 4 - incorrectCount;
  const answered = attemptedCount;
  const accuracy = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;
  const attemptRate = Math.round((answered / totalQuestions) * 100);
  const avgTimePerQuestion = attemptedCount > 0 ? Math.round(timeTaken / attemptedCount) : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getGrade = () => {
    if (accuracy >= 90) return { grade: "Excellent", color: "text-green-600" };
    if (accuracy >= 75) return { grade: "Very Good", color: "text-blue-600" };
    if (accuracy >= 50) return { grade: "Good", color: "text-yellow-600" };
    if (accuracy >= 30) return { grade: "Average", color: "text-orange-600" };
    return { grade: "Needs Improvement", color: "text-red-600" };
  };

  const { grade, color } = getGrade();

  const topicPerformanceMap: Record<string, { correct: number; attempted: number }> = {};
  questions.forEach((question, index) => {
    const userAnswer = answers[index];
    const chapter = question.chapterName;
    if (!topicPerformanceMap[chapter]) {
      topicPerformanceMap[chapter] = { correct: 0, attempted: 0 };
    }
    if (userAnswer !== null) {
      topicPerformanceMap[chapter].attempted += 1;
      if (userAnswer === question.correctAnswer) {
        topicPerformanceMap[chapter].correct += 1;
      }
    }
  });

  const topicPerformance = Object.entries(topicPerformanceMap).map(
    ([topic, { correct, attempted }]) => ({ topic, correct, attempted })
  );

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const result: TestResult = {
      testId: `${Date.now()}`,
      testLabel: testLabel || undefined, // naam pass karo
      date: new Date().toISOString(),
      testType,
      score,
      totalMarks,
      correct: correctCount,
      incorrect: incorrectCount,
      unattempted: unattemptedCount,
      attempted: attemptedCount,
      accuracy,
      timeTaken,
      topics: Object.keys(topicPerformanceMap),
      topicPerformance,
    };

    (async () => {
      await saveResult(result);
    })();

    if (testType === "full") {
      const storedUser = localStorage.getItem("neet_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        supabase.from("mock_test_results").insert({
          user_id: userData.id,
          user_name: userData.name,
          test_id: testLabel || testType,
          score: score,
          accuracy: accuracy,
          time_taken: timeTaken,
          correct_answers: correctCount,
          wrong_answers: incorrectCount,
          unattempted: unattemptedCount,
        }).then(({ error }) => {
          if (error) console.error("Leaderboard save error:", JSON.stringify(error));
        });
      }
    }

    try {
      const storedUser = localStorage.getItem("neet_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const progressKey = `neet_progress_${user.id}`;
        const existing = JSON.parse(
          localStorage.getItem(progressKey) ||
          localStorage.getItem("neet_progress") ||
          '{"totalAttempted":0,"totalCorrect":0,"chapterProgress":{}}'
        );
        questions.forEach((q, i) => {
          const answer = answers[i];
          if (answer !== null) {
            const isCorrect = answer === q.correctAnswer;
            existing.totalAttempted += 1;
            existing.totalCorrect += isCorrect ? 1 : 0;
            if (!existing.chapterProgress[q.chapterId]) {
              existing.chapterProgress[q.chapterId] = { attempted: 0, correct: 0 };
            }
            existing.chapterProgress[q.chapterId].attempted += 1;
            existing.chapterProgress[q.chapterId].correct += isCorrect ? 1 : 0;
          }
        });
        localStorage.setItem(progressKey, JSON.stringify(existing));
        localStorage.setItem("neet_progress", JSON.stringify(existing));
      }
    } catch {
      // ignore
    }
  }, []);

  const weakTopics = (() => {
    const stats: Record<string, { correct: number; attempted: number }> = {};
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const chapter = question.chapterName;
      if (!stats[chapter]) {
        stats[chapter] = { correct: 0, attempted: 0 };
      }
      if (userAnswer !== null) {
        stats[chapter].attempted += 1;
        if (userAnswer === question.correctAnswer) {
          stats[chapter].correct += 1;
        }
      }
    });

    return Object.entries(stats)
      .map(([chapter, { correct, attempted }]) => ({
        chapter,
        attempted,
        accuracy: attempted > 0 ? (correct / attempted) * 100 : 100,
      }))
      .filter((topic) => topic.attempted > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
  })();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Test Completed!</h1>
          <p className="text-muted-foreground">
            {(testLabel ?? (testType === "full" ? "Full Mock Test" : "Demo Test"))} Results
          </p>
        </div>

        <Card className="border-border mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold text-foreground">{score}</p>
                <p className="text-sm text-muted-foreground">out of {totalMarks} marks</p>
              </div>
              <div>
                <p className={`text-4xl font-bold ${color}`}>{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${color}`}>{grade}</p>
                <p className="text-sm text-muted-foreground">Performance Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Result Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{correctCount}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{incorrectCount}</p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <MinusCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{unattemptedCount}</p>
                  <p className="text-sm text-muted-foreground">Unattempted</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{attemptedCount}</p>
                  <p className="text-sm text-muted-foreground">Attempted</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {testType === "full" && (
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-border">
                  <CardContent className="pt-6 text-center">
                    <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{attemptRate}%</p>
                    <p className="text-sm text-muted-foreground">Attempt Rate</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{formatTime(timeTaken)}</p>
                    <p className="text-sm text-muted-foreground">Time Taken</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{avgTimePerQuestion}s</p>
                    <p className="text-sm text-muted-foreground">Avg Time / Q</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="pt-6 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{grade}</p>
                    <p className="text-sm text-muted-foreground">Performance Grade</p>
                  </CardContent>
                </Card>
              </div>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-foreground mb-2">Weak Topics</p>
                  {weakTopics.length > 0 ? (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {weakTopics.map((topic) => (
                        <li key={topic.chapter}>
                          <span className="font-medium text-foreground">{topic.chapter}</span> — {Math.round(topic.accuracy)}% accuracy
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No weak topics detected yet.</p>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Answer Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.slice(0, visibleCount).map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                const wasAttempted = userAnswer !== null;
                return (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="text-sm font-medium text-foreground">
                        Q{index + 1}. {question.question}
                      </p>
                      {wasAttempted ? (
                        isCorrect ? (
                          <Badge className="bg-green-500 flex-shrink-0">Correct</Badge>
                        ) : (
                          <Badge variant="destructive" className="flex-shrink-0">Incorrect</Badge>
                        )
                      ) : (
                        <Badge variant="secondary" className="flex-shrink-0">Skipped</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {wasAttempted && (
                        <p>Your answer: {userAnswer} - {question.options[userAnswer as keyof typeof question.options]}</p>
                      )}
                      <p className={isCorrect ? "text-green-600" : "text-red-600"}>
                        Correct answer: {question.correctAnswer} - {question.options[question.correctAnswer]}
                      </p>
                      {question.explanation && (
                        <p className="mt-2"><strong>Explanation:</strong> {question.explanation}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {visibleCount < questions.length && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setVisibleCount((prev) => prev + 5)}
              >
                Show More ({questions.length - visibleCount} remaining)
              </Button>
            )}
          </CardContent>
        </Card>

        {testType === "full" && (
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable testId={testType} />
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" asChild className="gap-2 w-full sm:w-auto">
            <Link href="/mock-test">
              <ArrowLeft className="h-4 w-4" />
              Back to Tests
            </Link>
          </Button>
          <Button onClick={onRetake} className="gap-2 w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" />
            Take Another Test
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}