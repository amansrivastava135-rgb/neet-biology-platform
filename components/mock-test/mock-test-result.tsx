"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getDemoQuestions } from "@/lib/data";
import { CheckCircle, XCircle, MinusCircle, Trophy, Target, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

type MockTestResultProps = {
  answers: (string | null)[];
  testType: "full" | "preview";
  onRetake: () => void;
};

export function MockTestResult({ answers, testType, onRetake }: MockTestResultProps) {
  const questions = getDemoQuestions().slice(0, testType === "full" ? 180 : 10);

  // Calculate scores
  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;

  answers.forEach((answer, index) => {
    const question = questions[index];
    if (!question) return;

    if (!answer) {
      unattempted++;
    } else if (answer === question.correctAnswer) {
      correct++;
    } else {
      incorrect++;
    }
  });

  const totalMarks = questions.length * 4;
  const obtainedMarks = correct * 4 - incorrect * 1;
  const percentage = Math.round((obtainedMarks / totalMarks) * 100);
  const answered = answers.filter((a) => a !== null).length;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { grade: "Excellent", color: "text-green-600" };
    if (percentage >= 75) return { grade: "Very Good", color: "text-blue-600" };
    if (percentage >= 60) return { grade: "Good", color: "text-yellow-600" };
    if (percentage >= 40) return { grade: "Average", color: "text-orange-600" };
    return { grade: "Needs Improvement", color: "text-red-600" };
  };

  const { grade, color } = getGrade();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Test Completed!</h1>
          <p className="text-muted-foreground">
            {testType === "full" ? "Full Mock Test" : "Demo Test"} Results
          </p>
        </div>

        {/* Score Card */}
        <Card className="border-border mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold text-foreground">{obtainedMarks}</p>
                <p className="text-sm text-muted-foreground">out of {totalMarks} marks</p>
              </div>
              <div>
                <p className={`text-4xl font-bold ${color}`}>{percentage}%</p>
                <p className="text-sm text-muted-foreground">Score Percentage</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${color}`}>{grade}</p>
                <p className="text-sm text-muted-foreground">Performance Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{correct}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{incorrect}</p>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6 text-center">
              <MinusCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{unattempted}</p>
              <p className="text-sm text-muted-foreground">Unattempted</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6 text-center">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Marking Scheme */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Marking Scheme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-semibold text-green-700">+4</p>
                <p className="text-green-600">Correct Answer</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="font-semibold text-red-700">-1</p>
                <p className="text-red-600">Incorrect Answer</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-semibold text-muted-foreground">0</p>
                <p className="text-muted-foreground">Unattempted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Review */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Answer Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((question, index) => {
                const answer = answers[index];
                const isCorrect = answer?.selectedOption === question.correctAnswer;
                const wasAttempted = !!answer?.selectedOption;

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
                          <Badge variant="destructive" className="flex-shrink-0">Wrong</Badge>
                        )
                      ) : (
                        <Badge variant="secondary" className="flex-shrink-0">Skipped</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {wasAttempted && !isCorrect && (
                        <p>Your answer: {answer?.selectedOption} - {question.options[answer?.selectedOption as keyof typeof question.options]}</p>
                      )}
                      <p className="text-green-600">
                        Correct answer: {question.correctAnswer} - {question.options[question.correctAnswer]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
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
            <Link href="/dashboard">
              View Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
