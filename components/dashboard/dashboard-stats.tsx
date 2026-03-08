"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle, TrendingUp, BookOpen } from "lucide-react";
import type { UserProgress } from "@/lib/auth-context";

type DashboardStatsProps = {
  progress: UserProgress;
};

export function DashboardStats({ progress }: DashboardStatsProps) {
  const accuracy = progress.totalAttempted > 0
    ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
    : 0;

  const chaptersAttempted = Object.keys(progress.chapterProgress).length;

  const stats = [
    {
      label: "Questions Attempted",
      value: progress.totalAttempted,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Correct Answers",
      value: progress.totalCorrect,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Accuracy Rate",
      value: `${accuracy}%`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Chapters Practiced",
      value: chaptersAttempted,
      icon: BookOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
