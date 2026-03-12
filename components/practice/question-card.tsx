"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { type Question } from "@/lib/data";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, BookOpen, Lightbulb } from "lucide-react";

type QuestionCardProps = {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit?: () => void;
  onAnswer?: (option: string) => void;
  selectedOption?: string | null;
  isDemo: boolean;
  isLimited: boolean;
};

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  onPrevious,
  onSubmit,
  onAnswer,
  selectedOption: selectedOptionProp,
  isDemo,
  isLimited,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(selectedOptionProp ?? null);
  const [showAnswer, setShowAnswer] = useState(false);
  const { user, updateProgress } = useAuth();

  useEffect(() => {
    setSelectedOption(selectedOptionProp ?? null);
  }, [selectedOptionProp]);


  const handleOptionSelect = (option: string) => {
    if (showAnswer) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setShowAnswer(true);

    // Update progress if user is logged in
    if (user) {
      const isCorrect = selectedOption === question.correctAnswer;
      updateProgress(question.chapterId, isCorrect);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowAnswer(false);
    onNext();
  };

  const handlePreviousQuestion = () => {
    setSelectedOption(null);
    setShowAnswer(false);
    onPrevious();
  };

  const isCorrect = selectedOption === question.correctAnswer;

  const getOptionClass = (option: string) => {
    const baseClass = "w-full p-4 text-left rounded-lg border transition-all flex items-start gap-3";
    
    if (!showAnswer) {
      if (selectedOption === option) {
        return `${baseClass} border-primary bg-primary/10`;
      }
      return `${baseClass} border-border hover:border-primary/50 hover:bg-muted/50`;
    }
    
    // After answer revealed
    if (option === question.correctAnswer) {
      return `${baseClass} border-green-500 bg-green-50 text-green-900`;
    }
    if (selectedOption === option && option !== question.correctAnswer) {
      return `${baseClass} border-red-500 bg-red-50 text-red-900`;
    }
    return `${baseClass} border-border opacity-50`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{question.chapterName}</Badge>
          <Badge variant={question.source === "PYQ" ? "default" : "outline"}>
            {question.source}
            {question.year && ` ${question.year}`}
          </Badge>
          {isDemo && <Badge variant="outline">Demo</Badge>}
        </div>
        <span className="text-sm text-muted-foreground">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question Card */}
      <Card className="border-border mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-medium leading-relaxed">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(question.options).map(([key, value]) => (
            <button
              key={key}
              className={getOptionClass(key)}
              onClick={() => handleOptionSelect(key)}
              disabled={showAnswer}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium flex-shrink-0">
                {key}
              </span>
              <span className="pt-0.5">{value}</span>
              {showAnswer && key === question.correctAnswer && (
                <CheckCircle className="h-5 w-5 text-green-600 ml-auto flex-shrink-0" />
              )}
              {showAnswer && selectedOption === key && key !== question.correctAnswer && (
                <XCircle className="h-5 w-5 text-red-600 ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Result and Explanation */}
      {showAnswer && (
        <div className="space-y-4 mb-6">
          <Alert variant={isCorrect ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <AlertTitle>
                {isCorrect ? "Correct!" : "Incorrect"}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {!isCorrect && (
                <p className="mb-2">
                  The correct answer is <strong>{question.correctAnswer}</strong>: {question.options[question.correctAnswer]}
                </p>
              )}
            </AlertDescription>
          </Alert>

          <Card className="border-border bg-muted/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                <CardTitle className="text-base">Explanation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>Reference: NCERT Biology - {question.chapterName}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Limited access warning */}
      {isLimited && questionNumber === totalQuestions && showAnswer && (
        <Alert className="mb-6">
          <AlertTitle>You have reached the free limit</AlertTitle>
          <AlertDescription>
            Upgrade to Premium to access all 100 questions in this chapter and unlock 
            all other chapters.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={questionNumber === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {isDemo && questionNumber === totalQuestions ? (
          <Button onClick={onSubmit} disabled={!selectedOption} className="gap-2">
            Submit Test
          </Button>
        ) : !showAnswer ? (
          <Button onClick={handleCheckAnswer} disabled={!selectedOption}>
            Check Answer
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            disabled={questionNumber === totalQuestions}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
