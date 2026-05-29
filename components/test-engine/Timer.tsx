"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export type TimerProps = {
  timeLeft: number;
  warningThreshold?: number;
};

export function Timer({ timeLeft, warningThreshold = 300 }: TimerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
        mounted && timeLeft < warningThreshold
          ? "bg-destructive/10 text-destructive"
          : "bg-muted"
      }`}
    >
      <Clock className="h-4 w-4" />
      <span className="font-mono font-medium">
        {mounted ? formatTime(timeLeft) : "--:--"}
      </span>
    </div>
  );
}
