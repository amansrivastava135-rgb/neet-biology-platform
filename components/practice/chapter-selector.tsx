"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { class11Chapters, class12Chapters } from "@/lib/data";
import { BookOpen, Lock, Play, Sparkles } from "lucide-react";

type ChapterSelectorProps = {
  onSelectChapter: (chapterId: number) => void;
  onStartDemo: () => void;
  isPaidUser: boolean;
};

export function ChapterSelector({ onSelectChapter, onStartDemo, isPaidUser }: ChapterSelectorProps) {
  const [activeClass, setActiveClass] = useState<"11" | "12">("11");

  const chapters = activeClass === "11" ? class11Chapters : class12Chapters;

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

      {/* Class Tabs */}
      <Tabs value={activeClass} onValueChange={(v) => setActiveClass(v as "11" | "12")}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="11">Class 11 Biology</TabsTrigger>
          <TabsTrigger value="12">Class 12 Biology</TabsTrigger>
        </TabsList>

        <TabsContent value={activeClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter, index) => {
              const isUnlocked = isPaidUser || index < 2; // First 2 chapters free
              
              return (
                <Card 
                  key={chapter.id} 
                  className={`border-border hover:border-primary/50 transition-colors ${
                    !isUnlocked ? "opacity-75" : ""
                  }`}
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
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          PYQ + NCERT
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant={isUnlocked ? "default" : "secondary"}
                      onClick={() => isUnlocked && onSelectChapter(chapter.id)}
                      disabled={!isUnlocked}
                    >
                      {isUnlocked ? "Start Practice" : "Unlock Premium"}
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
