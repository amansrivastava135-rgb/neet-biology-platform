"use client";

import React from "react";

export type QuestionPaletteProps = {
  answers: (string | null)[];
  visited: boolean[];
  review: boolean[];
  bookmarked: boolean[];
  currentIndex: number;
  goTo: (index: number) => void;
};

export function QuestionPalette({
  answers,
  visited,
  review,
  bookmarked,
  currentIndex,
  goTo,
}: QuestionPaletteProps) {
  const getQuestionStatus = (index: number) => {
    if (bookmarked[index]) return "bookmarked";
    if (review[index] && answers[index] !== null) return "review-answered";
    if (review[index]) return "review";
    if (!visited[index]) return "not-visited";
    if (answers[index] !== null) return "answered";
    return "not-answered";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-green-500 text-white";
      case "not-visited":
        return "bg-slate-200 text-slate-700";
      case "not-answered":
        return "bg-red-500 text-white";
      case "review":
        return "bg-purple-500 text-white";
      case "review-answered":
        return "bg-purple-500 text-white ring-2 ring-green-500";
      case "bookmarked":
        return "bg-amber-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-4">Question Palette</h3>
      {/* Legend remains where the component is used */}
      <div className="grid grid-cols-5 gap-2">
        {answers.map((_, index) => (
          <button
            key={index}
            className={`h-8 w-8 rounded text-xs font-medium transition-all ${
              getStatusColor(getQuestionStatus(index))
            } ${currentIndex === index ? "ring-2 ring-primary ring-offset-2" : ""}`}
            onClick={() => goTo(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
