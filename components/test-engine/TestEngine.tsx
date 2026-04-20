"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Bookmark,
} from "lucide-react";
import { Question } from "@/lib/data";
import { QuestionPalette } from "./QuestionPalette";
import { Timer } from "./Timer";

export type TestSubmitPayload = {
  questions: Question[];
  answers: (string | null)[];
  timeTaken: number;
  testType: string;
};

export type TestEngineProps = {
  questions: Question[];
  totalTime: number;
  storageKey: string;
  onSubmit: (payload: TestSubmitPayload) => void;
  isPaidUser: boolean;
  testLabel: string;
  initialTestType: string;
};

function saveProgressToStorage(questions: Question[], answers: (string | null)[]) {
  try {
    const storedUser = localStorage.getItem("neet_user");
    if (!storedUser) return;
    const user = JSON.parse(storedUser);
    const progressKey = `neet_progress_${user.id}`;
    const existing = JSON.parse(
      localStorage.getItem(progressKey) ||
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
  } catch {}
}

export function TestEngine({
  questions,
  totalTime,
  storageKey,
  onSubmit,
  isPaidUser,
  testLabel,
  initialTestType,
}: TestEngineProps) {
  useEffect(() => {
    if (initialTestType === "full" && !isPaidUser) {
      window.location.href = "/pricing";
    }
  }, [initialTestType, isPaidUser]);

  const savedState = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [storageKey]);

  const [currentIndex, setCurrentIndex] = useState(() => savedState?.currentIndex ?? 0);
  const [answers, setAnswers] = useState<(string | null)[]>(() => {
    if (Array.isArray(savedState?.answers) && savedState.answers.length === questions.length) {
      return savedState.answers;
    }
    return Array(questions.length).fill(null);
  });
  const [visitedQuestions, setVisitedQuestions] = useState<boolean[]>(() => {
    if (Array.isArray(savedState?.visited) && savedState.visited.length === questions.length) {
      return savedState.visited;
    }
    const arr = Array(questions.length).fill(false);
    arr[0] = true;
    return arr;
  });
  const [markedForReview, setMarkedForReview] = useState<boolean[]>(() => {
    if (Array.isArray(savedState?.markedForReview) && savedState.markedForReview.length === questions.length) {
      return savedState.markedForReview;
    }
    return Array(questions.length).fill(false);
  });
  const [bookmarked, setBookmarked] = useState<boolean[]>(() => {
    if (Array.isArray(savedState?.bookmarked) && savedState.bookmarked.length === questions.length) {
      return savedState.bookmarked;
    }
    return Array(questions.length).fill(false);
  });

  const hasTimer = totalTime > 0;
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!hasTimer) return totalTime;
    if (typeof savedState?.timeLeft === "number") {
      return Math.min(Math.max(0, savedState.timeLeft), totalTime);
    }
    return totalTime;
  });
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">No questions available for this set.</p>
          <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, questions.length - 1);
  const currentQuestion = questions[safeIndex];
  const currentAnswer = answers[safeIndex];

  const clearStoredTest = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(storageKey);
  };

  const persistTestState = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        answers, currentIndex, visited: visitedQuestions,
        markedForReview, bookmarked, timeLeft,
      }));
    } catch {}
  };

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  useEffect(() => {
    setVisitedQuestions((prev) => {
      if (prev[currentIndex]) return prev;
      const updated = [...prev];
      updated[currentIndex] = true;
      return updated;
    });
  }, [currentIndex]);

  useEffect(() => {
    persistTestState();
  }, [answers, currentIndex, visitedQuestions, markedForReview, bookmarked, timeLeft]);
  
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  
  const submitTest = useCallback((autoSubmit = false) => {
    if (hasSubmitted) return;
    setHasSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = hasTimer ? totalTime - timeLeftRef.current : 0;
    clearStoredTest();
    saveProgressToStorage(questionsRef.current, answersRef.current);
    onSubmit({
      questions: questionsRef.current,
      answers: answersRef.current,
      timeTaken: timeTaken > 0 ? timeTaken : hasTimer ? totalTime : 0,
      testType: initialTestType,
    });
  }, [hasSubmitted, onSubmit, timeLeft, totalTime, initialTestType, hasTimer]);

  useEffect(() => {
    if (hasSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hasSubmitted, totalTime]);

  useEffect(() => {
    if (!hasTimer) return;
    if (timeLeft > 0 || hasSubmitted) return;
    submitTest(true);
  }, [timeLeft, hasSubmitted, submitTest]);

  const handleAnswer = (option: string) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[safeIndex] = option;
      return updated;
    });
  };

  const handleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const updated = [...prev];
      updated[safeIndex] = !updated[safeIndex];
      return updated;
    });
  };

  const handleToggleBookmark = () => {
    setBookmarked((prev) => {
      const updated = [...prev];
      updated[safeIndex] = !updated[safeIndex];
      return updated;
    });
  };

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[safeIndex] = null;
      return updated;
    });
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setVisitedQuestions((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const notAnsweredCount = visitedQuestions.filter((v, i) => v && answers[i] === null).length;
  const reviewCount = markedForReview.filter(Boolean).length;
  const bookmarkedCount = bookmarked.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">{testLabel}</span>
          </div>
          <div className="flex items-center gap-4">
            {hasTimer && <Timer timeLeft={timeLeft} />}
            <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Submit Test</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to submit the test?</AlertDialogTitle>
                  <div className="space-y-2">
                    <AlertDialogDescription>
                      You have answered {answeredCount} out of {questions.length} questions.
                      {reviewCount > 0 && ` ${reviewCount} questions are marked for review.`}
                    </AlertDialogDescription>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Answered</span>
                      <span className="font-medium text-foreground">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Not Answered</span>
                      <span className="font-medium text-foreground">{notAnsweredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Marked for Review</span>
                      <span className="font-medium text-foreground">{reviewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bookmarked</span>
                      <span className="font-medium text-foreground">{bookmarkedCount}</span>
                    </div>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => submitTest(false)}>Submit Anyway</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{currentQuestion?.chapterName || "Biology"}</Badge>
                    <Badge variant={currentQuestion?.source === "PYQ" ? "default" : "outline"}>
                      {currentQuestion?.source || "NCERT"}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Question {safeIndex + 1} of {questions.length}
                  </span>
                </div>

                {currentQuestion && (currentQuestion as any).imageUrl && (
                  <img
                    src={(currentQuestion as any).imageUrl}
                    alt="Question image"
                    className="max-h-64 mx-auto mb-4 rounded-lg object-contain"
                  />
                )}

                <h2 className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                  {currentQuestion?.question || ""}
                </h2>

                <div role="radiogroup" aria-label="Answer options" className="space-y-3 mb-6">
                  {currentQuestion && Object.entries(currentQuestion.options).map(([key, value]) => (
                    <button
                      key={key}
                      role="radio"
                      aria-checked={currentAnswer === key}
                      aria-label={`Option ${key}: ${value}`}
                      className={`w-full p-4 text-left rounded-lg border transition-all flex items-start gap-3 ${
                        currentAnswer === key
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      onClick={() => handleAnswer(key)}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium flex-shrink-0">
                        {key}
                      </span>
                      <span className="pt-0.5">{value}</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleMarkForReview}
                    className={markedForReview[safeIndex] ? "border-purple-500 text-purple-600" : ""}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {markedForReview[safeIndex] ? "Marked for Review" : "Mark for Review"}
                  </Button>
                  <Button
                    variant={bookmarked[safeIndex] ? "secondary" : "outline"}
                    onClick={handleToggleBookmark}
                    className={bookmarked[safeIndex] ? "border-amber-400 text-amber-700" : ""}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    {bookmarked[safeIndex] ? "Bookmarked" : "Bookmark"}
                  </Button>
                  <Button variant="ghost" onClick={handleClearResponse}>
                    Clear Response
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => goToQuestion(Math.max(0, safeIndex - 1))}
                disabled={safeIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {safeIndex === questions.length - 1 ? (
                <Button variant="destructive" onClick={() => submitTest(false)} className="gap-2">
                  Submit Test
                </Button>
              ) : (
                <Button
                  onClick={() => goToQuestion(Math.min(questions.length - 1, safeIndex + 1))}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-border sticky top-20">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-slate-200"></span>
                    <span className="text-muted-foreground">Not Visited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-red-500"></span>
                    <span className="text-muted-foreground">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-green-500"></span>
                    <span className="text-muted-foreground">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-purple-500"></span>
                    <span className="text-muted-foreground">Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-amber-500"></span>
                    <span className="text-muted-foreground">Bookmarked</span>
                  </div>
                </div>

                <QuestionPalette
                  answers={answers}
                  visited={visitedQuestions}
                  review={markedForReview}
                  bookmarked={bookmarked}
                  currentIndex={safeIndex}
                  goTo={goToQuestion}
                />

                <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Answered:</span>
                    <span className="font-medium text-foreground">{answeredCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Not Answered:</span>
                    <span className="font-medium text-foreground">{questions.length - answeredCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marked for Review:</span>
                    <span className="font-medium text-foreground">{reviewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bookmarked:</span>
                    <span className="font-medium text-foreground">{bookmarkedCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}