"use client";

import { useState, useEffect } from "react";
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
import { Clock, Flag, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { sampleQuestions, type Question } from "@/lib/data";

type MockTestInterfaceProps = {
  testType: "full" | "preview";
  onSubmit: (answers: (string | null)[]) => void;
  isPaidUser: boolean;
};

export function MockTestInterface({ testType, onSubmit, isPaidUser }: MockTestInterfaceProps) {
  // Generate questions for the test - 180 for full test, 10 for demo
  const questions: Question[] = testType === "full" 
    ? sampleQuestions.slice(0, 180) 
    : sampleQuestions.slice(0, 10);
  const totalTime = testType === "full" ? 180 * 60 : 10 * 60; // seconds

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    () => Array(questions.length).fill(null)
  );
  const [markedForReview, setMarkedForReview] = useState<boolean[]>(
    () => Array(questions.length).fill(false)
  );
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmit(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [answers, onSubmit]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];

  const handleAnswer = (index: number, option: string) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[index] = option;
      return updated;
    });
  };

  const handleOptionSelect = (option: string) => {
    handleAnswer(currentIndex, option);
  };

  const handleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const updated = [...prev];
      updated[currentIndex] = !updated[currentIndex];
      return updated;
    });
  };

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentIndex] = null;
      return updated;
    });
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const getQuestionStatus = (answer: string | null, index: number) => {
    if (markedForReview[index] && answer) return "review-answered";
    if (markedForReview[index]) return "review";
    if (answer) return "answered";
    return "not-visited";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-green-500 text-white";
      case "review":
        return "bg-purple-500 text-white";
      case "review-answered":
        return "bg-purple-500 text-white ring-2 ring-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const answeredCount = answers.filter(Boolean).length;
  const reviewCount = markedForReview.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              {testType === "full" ? "Full Mock Test" : "Demo Test"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              timeLeft < 300 ? "bg-destructive/10 text-destructive" : "bg-muted"
            }`}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </div>
            <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Submit Test</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have answered {answeredCount} out of {questions.length} questions.
                    {reviewCount > 0 && ` ${reviewCount} questions are marked for review.`}
                    <br />
                    Are you sure you want to submit?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Test</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <Card className="border-border">
              <CardContent className="p-6">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{currentQuestion.chapterName}</Badge>
                    <Badge variant={currentQuestion.source === "PYQ" ? "default" : "outline"}>
                      {currentQuestion.source}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>

                {/* Question */}
                <h2 className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <button
                      key={key}
                      className={`w-full p-4 text-left rounded-lg border transition-all flex items-start gap-3 ${
                        currentAnswer === key
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                      onClick={() => handleOptionSelect(key)}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium flex-shrink-0">
                        {key}
                      </span>
                      <span className="pt-0.5">{value}</span>
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleMarkForReview}
                    className={markedForReview[currentIndex] ? "border-purple-500 text-purple-600" : ""}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    {markedForReview[currentIndex] ? "Marked for Review" : "Mark for Review"}
                  </Button>
                  <Button variant="ghost" onClick={handleClearResponse}>
                    Clear Response
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentIndex === questions.length - 1 ? (
                <Button variant="destructive" onClick={handleSubmit} className="gap-2">
                  Submit Test
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <Card className="border-border sticky top-20">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-4">Question Palette</h3>
                
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-green-500"></span>
                    <span className="text-muted-foreground">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-muted"></span>
                    <span className="text-muted-foreground">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded bg-purple-500"></span>
                    <span className="text-muted-foreground">Review</span>
                  </div>
                </div>

                {/* Questions Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {answers.map((answer, index) => (
                    <button
                      key={index}
                      className={`h-8 w-8 rounded text-xs font-medium transition-all ${
                        getStatusColor(getQuestionStatus(answer, index))
                      } ${currentIndex === index ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      onClick={() => goToQuestion(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {/* Stats */}
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
