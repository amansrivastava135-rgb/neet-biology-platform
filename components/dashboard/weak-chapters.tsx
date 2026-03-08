"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { UserProgress } from "@/lib/auth-context";
import { class11Chapters, class12Chapters } from "@/lib/data";

type WeakChaptersProps = {
  progress: UserProgress;
};

export function WeakChapters({ progress }: WeakChaptersProps) {
  const allChapters = [...class11Chapters, ...class12Chapters];
  
  // Find chapters with low accuracy (< 60%) and at least 3 attempts
  const weakChapters = Object.entries(progress.chapterProgress)
    .map(([chapterId, data]) => {
      const chapter = allChapters.find(c => c.id === parseInt(chapterId));
      const accuracy = data.attempted > 0 
        ? Math.round((data.correct / data.attempted) * 100) 
        : 0;
      return {
        id: parseInt(chapterId),
        name: chapter?.name || `Chapter ${chapterId}`,
        accuracy,
        attempted: data.attempted,
        correct: data.correct,
      };
    })
    .filter(c => c.accuracy < 60 && c.attempted >= 3)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  if (weakChapters.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Weak Chapters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {Object.keys(progress.chapterProgress).length === 0
                ? "Practice more to identify weak areas!"
                : "Great job! No weak chapters identified yet."}
            </p>
            <Button asChild>
              <Link href="/practice">Start Practicing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Weak Chapters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Chapters with accuracy below 60%. Focus on these to improve your score.
        </p>
        <div className="space-y-4">
          {weakChapters.map((chapter) => (
            <div key={chapter.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                  {chapter.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {chapter.accuracy}%
                </span>
              </div>
              <Progress 
                value={chapter.accuracy} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{chapter.correct}/{chapter.attempted} correct</span>
                <Button variant="link" size="sm" className="h-auto p-0" asChild>
                  <Link href="/practice" className="flex items-center gap-1">
                    Practice
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
