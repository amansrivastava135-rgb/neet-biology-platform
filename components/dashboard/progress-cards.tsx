import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Star, Trophy } from "lucide-react";
import { summarize, TestResult } from "@/lib/analytics";

interface ProgressCardsProps {
  results: TestResult[];
}

export function ProgressCards({ results }: ProgressCardsProps) {
  const { totalTests, avgAccuracy, bestScore } = summarize(results);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-border">
        <CardContent className="pt-6 text-center">
          <Target className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalTests}</p>
          <p className="text-sm text-muted-foreground">Tests Taken</p>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardContent className="pt-6 text-center">
          <Star className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{avgAccuracy}%</p>
          <p className="text-sm text-muted-foreground">Avg Accuracy</p>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardContent className="pt-6 text-center">
          <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{bestScore}</p>
          <p className="text-sm text-muted-foreground">Best Score</p>
        </CardContent>
      </Card>
    </div>
  );
}
