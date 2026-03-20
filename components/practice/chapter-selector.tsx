"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { BookOpen, Lock, Play, Sparkles, ChevronRight, X } from "lucide-react";

type ChapterSelectorProps = {
  onSelectChapter: (chapterId: number, setNumber?: number) => void;
  onStartDemo: () => void;
  isPaidUser: boolean;
};

type SetInfo = {
  setNumber: number;
  label: string;
  questionCount: number;
  type: "auto" | "manual";
};

function getAdminQuestions() {
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("neet_admin_questions");
      return stored ? JSON.parse(stored) : [];
    }
  } catch {}
  return [];
}

function getSetsForChapter(chapterId: number): SetInfo[] {
  const { sampleQuestions } = require("@/lib/data");
  const adminQuestions = getAdminQuestions();
  const allQuestions = [...adminQuestions, ...sampleQuestions].filter(
    (q: any) => q.chapterId === chapterId
  );

  const manualSets: Record<number, number> = {};
  const autoQuestions: any[] = [];

  allQuestions.forEach((q: any) => {
    if (q.setNumber) {
      manualSets[q.setNumber] = (manualSets[q.setNumber] || 0) + 1;
    } else {
      autoQuestions.push(q);
    }
  });

  const sets: SetInfo[] = [];

  Object.entries(manualSets).forEach(([num, count]) => {
    sets.push({
      setNumber: parseInt(num),
      label: `Set ${num}`,
      questionCount: count,
      type: "manual",
    });
  });

  const SET_SIZE = 90;
  for (let i = 0; i < autoQuestions.length; i += SET_SIZE) {
    const setNum = sets.length + 1;
    sets.push({
      setNumber: setNum,
      label: `Set ${setNum}`,
      questionCount: Math.min(SET_SIZE, autoQuestions.length - i),
      type: "auto",
    });
  }

  const pyqCount = allQuestions.filter((q: any) => q.source === "PYQ").length;
  if (pyqCount > 0) {
    sets.push({
      setNumber: sets.length + 1,
      label: "PYQ Set",
      questionCount: pyqCount,
      type: "auto",
    });
  }

  return sets;
}

export function ChapterSelector({ onSelectChapter, onStartDemo, isPaidUser }: ChapterSelectorProps) {
  const [activeClass, setActiveClass] = useState<"11" | "12">("11");
  const [selectedChapter, setSelectedChapter] = useState<{ id: number; name: string } | null>(null);
  const [sets, setSets] = useState<SetInfo[]>([]);

  const chapters = activeClass === "11" ? class11Chapters : class12Chapters;

  const handleChapterClick = (chapter: { id: number; name: string }) => {
    const chapterSets = getSetsForChapter(chapter.id);
    setSelectedChapter(chapter);
    setSets(chapterSets);
  };

  const handleSetClick = (setNumber: number) => {
    if (selectedChapter) {
      onSelectChapter(selectedChapter.id, setNumber);
      setSelectedChapter(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Chapter-wise Practice</h1>
        <p className="text-muted-foreground">
          Select a chapter to start practicing NCERT-based MCQs
        </p>
      </div>

      {/* Demo Section */}
      <Card className="mb-8 border-primary/50 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Try Demo Questions</h3>
                <p className="text-sm text-muted-foreground">
                  10 sample questions from various chapters - no login required
                </p>
              </div>
            </div>
            <Button onClick={onStartDemo} className="gap-2">
              <Play className="h-4 w-4" />
              Start Demo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Set Selector Modal */}
      {selectedChapter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{selectedChapter.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedChapter(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Select a set to practice</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sets.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">
                    No questions available yet for this chapter.
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Admin can add questions from the admin panel.
                  </p>
                </div>
              ) : (
                sets.map((set) => (
                  <button
                    key={set.setNumber}
                    onClick={() => handleSetClick(set.setNumber)}
                    className="w-full p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {set.label === "PYQ Set" ? "PYQ" : set.setNumber}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">{set.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {set.questionCount} questions
                          {set.type === "manual" && (
                            <span className="ml-2 text-blue-500">• Custom Set</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Class Tabs */}
      <Tabs value={activeClass} onValueChange={(v) => setActiveClass(v as "11" | "12")}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="11">Class 11 Biology</TabsTrigger>
          <TabsTrigger value="12">Class 12 Biology</TabsTrigger>
        </TabsList>

        <TabsContent value={activeClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter, index) => {
              const isUnlocked = isPaidUser || index < 2;

              return (
                <Card
                  key={chapter.id}
                  className={`border-border hover:border-primary/50 transition-colors cursor-pointer ${
                    !isUnlocked ? "opacity-75" : ""
                  }`}
                  onClick={() => isUnlocked && handleChapterClick(chapter)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {index + 1}
                        </span>
                        <CardTitle className="text-base leading-snug">
                          {chapter.name}
                        </CardTitle>
                      </div>
                      {!isUnlocked && (
                        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {chapter.questionCount} MCQs
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        PYQ + NCERT
                      </Badge>
                    </div>
                    <Button
                      className="w-full mt-4"
                      variant={isUnlocked ? "default" : "secondary"}
                      disabled={!isUnlocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        isUnlocked && handleChapterClick(chapter);
                      }}
                    >
                      {isUnlocked ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Select Set
                        </>
                      ) : (
                        "Unlock Premium"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Premium Prompt */}
      {!isPaidUser && (
        <div className="mt-8 p-6 bg-secondary/50 rounded-lg text-center">
          <p className="text-foreground font-medium mb-2">
            Unlock all 38 chapters with Premium
          </p>
          <p className="text-muted-foreground text-sm mb-4">
            Get access to 3800+ MCQs, mock tests, and detailed analytics
          </p>
          <Button asChild>
            <a href="/pricing">View Pricing</a>
          </Button>
        </div>
      )}
    </div>
  );
}