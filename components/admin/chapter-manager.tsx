"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { BookOpen, FileQuestion, Edit, Plus } from "lucide-react";

export function ChapterManager() {
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
                  <ChapterRow key={chapter.id} chapter={chapter} index={index} />
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
                  <ChapterRow key={chapter.id} chapter={chapter} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                  {(class11Chapters.length + class12Chapters.length) * 100}
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
                <p className="text-2xl font-bold text-foreground">~1,200</p>
                <p className="text-sm text-muted-foreground">PYQs Included</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChapterRow({ chapter, index }: { chapter: { id: number; name: string; questionCount: number }; index: number }) {
  // Mock data for question breakdown
  const pyqCount = Math.floor(chapter.questionCount * 0.3);
  const ncertCount = chapter.questionCount - pyqCount;
  const completionPercentage = 100; // All chapters have 100 questions

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
              {chapter.questionCount} MCQs
            </Badge>
            <span className="text-xs text-muted-foreground">
              {pyqCount} PYQ | {ncertCount} NCERT
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
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
