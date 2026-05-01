"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { BookOpen, Lock, Play, Sparkles, ChevronRight, X, Calendar, Loader2 } from "lucide-react";
import { TRIAL_MAX_CHAPTERS } from "@/lib/pricing-config";

type ChapterSelectorProps = {
  onSelectChapter: (chapterId: number, setNumber?: number) => void;
  onStartDemo: () => void;
  onStartPYQYear: (year: number) => void;
  onStartPYQChapter: (chapterId: number) => void;
  isPaidUser: boolean;
  isTrial?: boolean;
};

type SetInfo = {
  setNumber: number;
  label: string;
  questionCount: number;
  type: "auto" | "manual";
};

async function getSetsForChapter(chapterId: number): Promise<SetInfo[]> {
  try {
    const res = await fetch(`/api/questions?chapterId=${chapterId}`);
    if (!res.ok) return [];
    const data = await res.json();
    const sets = (data.sets || []).filter((s: SetInfo) => s.label !== "PYQ Set");
    return sets;
  } catch {
    return [];
  }
}

async function getChapterQuestionCount(chapterId: number): Promise<number> {
  try {
    const res = await fetch(`/api/questions/count?chapterId=${chapterId}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

async function fetchPYQData() {
  try {
    const res = await fetch(`/api/questions?source=PYQ`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.questions || [];
  } catch {
    return [];
  }
}

function PYQTab({
  onStartPYQYear,
  onStartPYQChapter,
  isPaidUser,
}: {
  onStartPYQYear: (year: number) => void;
  onStartPYQChapter: (chapterId: number) => void;
  isPaidUser: boolean;
}) {
  const [pyqFilter, setPyqFilter] = useState<"year" | "chapter">("year");
  const [pyqQuestions, setPyqQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const allChapters = [...class11Chapters, ...class12Chapters];

  useEffect(() => {
    fetchPYQData().then((qs) => {
      setPyqQuestions(qs);
      setIsLoading(false);
    });
  }, []);

  const yearMap: Record<number, number> = {};
  pyqQuestions.forEach((q) => {
    if (q.year) yearMap[q.year] = (yearMap[q.year] || 0) + 1;
  });
  const pyqByYear = Object.entries(yearMap)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => b.year - a.year);

  const chapterMap: Record<number, number> = {};
  pyqQuestions.forEach((q) => {
    chapterMap[q.chapter_id] = (chapterMap[q.chapter_id] || 0) + 1;
  });
  const pyqByChapter = allChapters
    .map((chapter) => ({ chapter, count: chapterMap[chapter.id] || 0 }))
    .filter((c) => c.count > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">Filter by:</span>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setPyqFilter("year")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              pyqFilter === "year"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            Year
          </button>
          <button
            onClick={() => setPyqFilter("chapter")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              pyqFilter === "chapter"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-foreground hover:bg-muted"
            }`}
          >
            Chapter
          </button>
        </div>
      </div>

      {pyqFilter === "year" && (
        <div>
          {pyqByYear.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No PYQ questions available yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Admin can add PYQ questions from the admin panel
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pyqByYear.map(({ year, count }) => (
                <Card
                  key={year}
                  className={`border-border hover:border-primary/50 transition-colors cursor-pointer ${
                    !isPaidUser ? "opacity-75" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {String(year).slice(-2)}
                        </span>
                        <CardTitle className="text-base">NEET {year}</CardTitle>
                      </div>
                      {!isPaidUser && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{count} Questions</span>
                      </div>
                      <Badge variant="default" className="text-xs">PYQ</Badge>
                    </div>
                    <Button
                      className="w-full"
                      variant={isPaidUser ? "default" : "secondary"}
                      disabled={!isPaidUser}
                      onClick={() => isPaidUser && onStartPYQYear(year)}
                    >
                      {isPaidUser ? (
                        <><Play className="h-4 w-4 mr-2" />Practice {year} PYQ</>
                      ) : "Unlock Premium"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {pyqFilter === "chapter" && (
        <div>
          {pyqByChapter.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No PYQ questions available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pyqByChapter.map(({ chapter, count }) => (
                <Card
                  key={chapter.id}
                  className={`border-border hover:border-primary/50 transition-colors cursor-pointer ${
                    !isPaidUser ? "opacity-75" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {chapter.id}
                        </span>
                        <CardTitle className="text-base leading-snug">{chapter.name}</CardTitle>
                      </div>
                      {!isPaidUser && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{count} PYQs</span>
                      </div>
                      <Badge variant="default" className="text-xs">PYQ</Badge>
                    </div>
                    <Button
                      className="w-full"
                      variant={isPaidUser ? "default" : "secondary"}
                      disabled={!isPaidUser}
                      onClick={() => isPaidUser && onStartPYQChapter(chapter.id)}
                    >
                      {isPaidUser ? (
                        <><Play className="h-4 w-4 mr-2" />Practice PYQs</>
                      ) : "Unlock Premium"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!isPaidUser && (
        <div className="mt-8 p-6 bg-secondary/50 rounded-lg text-center">
          <p className="text-foreground font-medium mb-2">Unlock all PYQs with Premium</p>
          <p className="text-muted-foreground text-sm mb-4">
            Access year-wise and chapter-wise PYQs from 2010-2024
          </p>
          <Button asChild><a href="/pricing">View Pricing</a></Button>
        </div>
      )}
    </div>
  );
}

function ChapterCard({
  chapter,
  index,
  isUnlocked,
  isTrial,
  onClick,
}: {
  chapter: { id: number; name: string; questionCount: number };
  index: number;
  isUnlocked: boolean;
  isTrial?: boolean;
  onClick: () => void;
}) {
  const [questionCount, setQuestionCount] = useState<number | null>(null);

  useEffect(() => {
    getChapterQuestionCount(chapter.id).then(setQuestionCount);
  }, [chapter.id]);

  return (
    <Card
      className={`border-border hover:border-primary/50 transition-colors cursor-pointer ${
        !isUnlocked ? "opacity-75" : ""
      }`}
      onClick={() => isUnlocked && onClick()}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {index + 1}
            </span>
            <CardTitle className="text-base leading-snug">{chapter.name}</CardTitle>
          </div>
          {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {questionCount !== null
                ? `${questionCount} MCQs`
                : chapter.questionCount > 0
                ? `${chapter.questionCount} MCQs`
                : "Loading..."}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">PYQ + NCERT</Badge>
        </div>
        <Button
          className="w-full mt-4"
          variant={isUnlocked ? "default" : "secondary"}
          disabled={!isUnlocked}
          onClick={(e) => {
            e.stopPropagation();
            isUnlocked && onClick();
          }}
        >
          {isUnlocked ? (
            <><Play className="h-4 w-4 mr-2" />Select Set</>
          ) : isTrial ? "Upgrade to Unlock" : "Unlock Premium"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ChapterSelector({
  onSelectChapter,
  onStartDemo,
  onStartPYQYear,
  onStartPYQChapter,
  isPaidUser,
  isTrial = false,
}: ChapterSelectorProps) {
  const [activeTab, setActiveTab] = useState<"11" | "12" | "pyq">("11");
  const [selectedChapter, setSelectedChapter] = useState<{ id: number; name: string } | null>(null);
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [setsLoading, setSetsLoading] = useState(false);

  // Trial: Class 11 se pehle 3, Class 12 se pehle 2 = total 5
  const TRIAL_CLASS11_LIMIT = 3;
  const TRIAL_CLASS12_LIMIT = 2;

  const handleChapterClick = async (chapter: { id: number; name: string }) => {
    setSelectedChapter(chapter);
    setSets([]);
    setSetsLoading(true);
    const chapterSets = await getSetsForChapter(chapter.id);
    setSets(chapterSets);
    setSetsLoading(false);
  };

  const handleSetClick = (setNumber: number) => {
    if (selectedChapter) {
      onSelectChapter(selectedChapter.id, setNumber);
      setSelectedChapter(null);
    }
  };

  const getChapterUnlocked = (classType: "11" | "12", index: number): boolean => {
    if (isTrial) {
      return classType === "11" ? index < TRIAL_CLASS11_LIMIT : index < TRIAL_CLASS12_LIMIT;
    }
    return isPaidUser || index < 2;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Chapter-wise Practice</h1>
        <p className="text-muted-foreground">
          Select a chapter to start practicing NCERT-based MCQs
        </p>
      </div>

      {/* Trial Banner */}
      {isTrial && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Trial Access: {TRIAL_MAX_CHAPTERS} chapters unlocked
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Upgrade to Premium to unlock all 38 chapters
            </p>
          </div>
          <Button size="sm" asChild className="shrink-0">
            <a href="/pricing">Upgrade</a>
          </Button>
        </div>
      )}

      {!isPaidUser && !isTrial && (
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
                    10 sample questions from various chapters
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
      )}

      {selectedChapter && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{selectedChapter.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedChapter(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Select a set to practice</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {setsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground text-sm">Loading sets...</span>
                </div>
              ) : sets.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">No questions available yet.</p>
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
                        <span className="text-sm font-bold text-primary">{set.setNumber}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">{set.label}</p>
                        <p className="text-xs text-muted-foreground">{set.questionCount} questions</p>
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "11" | "12" | "pyq")}>
        <div className="overflow-x-auto mb-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 min-w-[320px]">
            <TabsTrigger value="11">Class 11 Biology</TabsTrigger>
            <TabsTrigger value="12">Class 12 Biology</TabsTrigger>
            <TabsTrigger value="pyq">Biology PYQ</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="11">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {class11Chapters.map((chapter, index) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                index={index}
                isUnlocked={getChapterUnlocked("11", index)}
                isTrial={isTrial}
                onClick={() => handleChapterClick(chapter)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {class12Chapters.map((chapter, index) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                index={index}
                isUnlocked={getChapterUnlocked("12", index)}
                isTrial={isTrial}
                onClick={() => handleChapterClick(chapter)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pyq">
          <PYQTab
            onStartPYQYear={onStartPYQYear}
            onStartPYQChapter={onStartPYQChapter}
            isPaidUser={isPaidUser}
          />
        </TabsContent>
      </Tabs>

      {!isPaidUser && activeTab !== "pyq" && (
        <div className="mt-8 p-6 bg-secondary/50 rounded-lg text-center">
          {isTrial ? (
            <>
              <p className="text-foreground font-medium mb-2">
                Trial: {TRIAL_MAX_CHAPTERS} of 38 chapters unlocked
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                Upgrade to Premium for all 38 chapters + unlimited mock tests
              </p>
            </>
          ) : (
            <>
              <p className="text-foreground font-medium mb-2">
                Unlock all 38 chapters with Premium
              </p>
              <p className="text-muted-foreground text-sm mb-4">
                Get access to 3800+ MCQs, mock tests, and detailed analytics
              </p>
            </>
          )}
          <Button asChild><a href="/pricing">View Pricing</a></Button>
        </div>
      )}
    </div>
  );
}