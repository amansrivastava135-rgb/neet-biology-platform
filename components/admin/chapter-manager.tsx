"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { BookOpen, FileQuestion, Edit, Plus, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ChapterStats = {
  chapterId: number;
  total: number;
  pyq: number;
  ncert: number;
};

export function ChapterManager() {
  const [chapterStats, setChapterStats] = useState<ChapterStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalPYQ, setTotalPYQ] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase
        .from("questions")
        .select("chapter_id, source");

      if (error || !data) {
        setIsLoading(false);
        return;
      }

      // Chapter wise stats calculate karo
      const statsMap: Record<number, ChapterStats> = {};
      data.forEach((q) => {
        if (!statsMap[q.chapter_id]) {
          statsMap[q.chapter_id] = { chapterId: q.chapter_id, total: 0, pyq: 0, ncert: 0 };
        }
        statsMap[q.chapter_id].total++;
        if (q.source === "PYQ") statsMap[q.chapter_id].pyq++;
        else statsMap[q.chapter_id].ncert++;
      });

      setChapterStats(Object.values(statsMap));
      setTotalQuestions(data.length);
      setTotalPYQ(data.filter((q) => q.source === "PYQ").length);
      setIsLoading(false);
    }
    fetchStats();
  }, []);

  const getStats = (chapterId: number): ChapterStats => {
    return chapterStats.find((s) => s.chapterId === chapterId) || {
      chapterId,
      total: 0,
      pyq: 0,
      ncert: 0,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Chapter Management</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all chapters and their question counts
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Chapter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading chapter data...</span>
        </div>
      ) : (
        <Tabs defaultValue="11">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="11">Class 11 ({class11Chapters.length})</TabsTrigger>
            <TabsTrigger value="12">Class 12 ({class12Chapters.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="11">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Class 11 Biology Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {class11Chapters.map((chapter, index) => (
                    <ChapterRow
                      key={chapter.id}
                      chapter={chapter}
                      index={index}
                      stats={getStats(chapter.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="12">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Class 12 Biology Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {class12Chapters.map((chapter, index) => (
                    <ChapterRow
                      key={chapter.id}
                      chapter={chapter}
                      index={index}
                      stats={getStats(chapter.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {class11Chapters.length + class12Chapters.length}
                </p>
                <p className="text-sm text-muted-foreground">Total Chapters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : totalQuestions}
                </p>
                <p className="text-sm text-muted-foreground">Total Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileQuestion className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? "..." : totalPYQ}
                </p>
                <p className="text-sm text-muted-foreground">PYQs Included</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChapterRow({
  chapter,
  index,
  stats,
}: {
  chapter: { id: number; name: string; questionCount: number };
  index: number;
  stats: ChapterStats;
}) {
  // Target 100 questions per chapter
  const TARGET = 100;
  const completionPercentage = Math.min(100, Math.round((stats.total / TARGET) * 100));

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
      <div className="flex items-center gap-4 flex-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{chapter.name}</p>
          <div className="flex items-center gap-4 mt-1">
            <Badge variant="secondary" className="text-xs">
              {stats.total} MCQs
            </Badge>
            <span className="text-xs text-muted-foreground">
              {stats.pyq} PYQ | {stats.ncert} NCERT
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24 hidden sm:block">
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {completionPercentage}% complete
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => alert(`Edit chapter: ${chapter.name}\n\nComing soon!`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}