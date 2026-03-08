"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import type { UserProgress } from "@/lib/auth-context";
import { class11Chapters, class12Chapters } from "@/lib/data";

type RecentActivityProps = {
  progress: UserProgress;
};

export function RecentActivity({ progress }: RecentActivityProps) {
  const allChapters = [...class11Chapters, ...class12Chapters];
  
  // Get recently practiced chapters
  const recentChapters = Object.entries(progress.chapterProgress)
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
    .slice(0, 5);

  if (recentChapters.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No recent activity. Start practicing to track your progress!
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/practice" className="flex items-center gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentChapters.map((chapter) => (
            <div 
              key={chapter.id} 
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{chapter.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {chapter.attempted} questions attempted
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-foreground">{chapter.correct}</span>
                    <XCircle className="h-4 w-4 text-red-500 ml-2" />
                    <span className="text-sm text-foreground">{chapter.attempted - chapter.correct}</span>
                  </div>
                  <Badge variant={chapter.accuracy >= 60 ? "default" : "secondary"} className="mt-1">
                    {chapter.accuracy}% accuracy
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
