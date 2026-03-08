"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { UserProgress } from "@/lib/auth-context";
import { class11Chapters, class12Chapters } from "@/lib/data";

type ProgressChartProps = {
  progress: UserProgress;
};

export function ProgressChart({ progress }: ProgressChartProps) {
  const allChapters = [...class11Chapters, ...class12Chapters];
  
  // Get data for chapters that have been attempted
  const chartData = Object.entries(progress.chapterProgress)
    .map(([chapterId, data]) => {
      const chapter = allChapters.find(c => c.id === parseInt(chapterId));
      const accuracy = data.attempted > 0 
        ? Math.round((data.correct / data.attempted) * 100) 
        : 0;
      return {
        name: chapter?.name.substring(0, 15) + "..." || `Chapter ${chapterId}`,
        fullName: chapter?.name || `Chapter ${chapterId}`,
        accuracy,
        attempted: data.attempted,
        correct: data.correct,
      };
    })
    .slice(0, 8); // Show top 8 chapters

  // If no data, show placeholder
  if (chartData.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Chapter-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Start practicing to see your performance chart!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Chapter-wise Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-foreground">{data.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          Accuracy: {data.accuracy}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.correct}/{data.attempted} correct
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="accuracy" 
                fill="hsl(var(--primary))" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
