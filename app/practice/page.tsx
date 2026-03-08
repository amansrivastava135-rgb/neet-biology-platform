"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { ChapterSelector } from "@/components/practice/chapter-selector";
import { QuestionCard } from "@/components/practice/question-card";
import { getDemoQuestions, getQuestionsByChapter, type Question } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function PracticeContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showingDemo, setShowingDemo] = useState(isDemo);

  const getQuestions = (): Question[] => {
    if (showingDemo || (!user && !selectedChapter)) {
      return getDemoQuestions();
    }
    if (selectedChapter) {
      const chapterQuestions = getQuestionsByChapter(selectedChapter);
      // For non-paid users, limit to first 3 questions per chapter
      if (!user?.isPaid && chapterQuestions.length > 3) {
        return chapterQuestions.slice(0, 3);
      }
      return chapterQuestions;
    }
    return [];
  };

  const questions = getQuestions();
  const currentQuestion = questions[currentQuestionIndex];

  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapter(chapterId);
    setCurrentQuestionIndex(0);
    setShowingDemo(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleBackToChapters = () => {
    setSelectedChapter(null);
    setShowingDemo(false);
    setCurrentQuestionIndex(0);
  };

  const handleStartDemo = () => {
    setShowingDemo(true);
    setSelectedChapter(null);
    setCurrentQuestionIndex(0);
  };

  // Show chapter selection if no chapter selected and not showing demo
  if (!selectedChapter && !showingDemo) {
    return (
      <ChapterSelector 
        onSelectChapter={handleChapterSelect} 
        onStartDemo={handleStartDemo}
        isPaidUser={user?.isPaid || false}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBackToChapters} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Chapters
        </Button>
      </div>

      {currentQuestion ? (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          isDemo={showingDemo}
          isLimited={!user?.isPaid && !showingDemo}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {showingDemo 
              ? "No demo questions available." 
              : "No questions available for this chapter yet."}
          </p>
          <Button onClick={handleBackToChapters}>Select Another Chapter</Button>
        </div>
      )}

      {/* Upgrade prompt for non-paid users */}
      {!user?.isPaid && !showingDemo && selectedChapter && (
        <div className="mt-8 p-6 bg-secondary/50 rounded-lg text-center">
          <p className="text-foreground font-medium mb-2">
            Unlock all 100 questions in this chapter
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            Get full access to all chapters, mock tests, and analytics for just Rs.99/month
          </p>
          <Button asChild>
            <Link href="/pricing">Upgrade to Premium</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function PracticePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
          <PracticeContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function PracticePageWrapper() {
  return (
    <AuthProvider>
      <PracticePage />
    </AuthProvider>
  );
}
