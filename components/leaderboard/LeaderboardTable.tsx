"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  user_name: string;
  score: number;
  accuracy: number;
  time_taken: number;
};

export function LeaderboardTable({ testId = "all" }: { testId?: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [type, setType] = useState<"alltime" | "weekly">("alltime");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/leaderboard?type=${type}&testId=all`);
    const json = await res.json();
    setData(json.data || []);
    setLastUpdated(new Date());
    setLoading(false);
  }, [type]);

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("leaderboard_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mock_test_results",
        },
        (payload) => {
          console.log("New result added:", payload);
          // Naya result aaya — leaderboard refresh karo
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  function getRankStyle(rank: number) {
    if (rank === 1) return "bg-yellow-50 border-yellow-300";
    if (rank === 2) return "bg-gray-50 border-gray-300";
    if (rank === 3) return "bg-orange-50 border-orange-300";
    return "";
  }

  function getRankIcon(rank: number) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  }

  const userEntry = data.find((d) => d.user_id === user?.id);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setType("alltime")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === "alltime"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setType("weekly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === "weekly"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            This Week
          </button>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              · Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Your Rank */}
      {userEntry && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-primary">
              {getRankIcon(userEntry.rank)}
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">Your Rank</p>
              <p className="text-xs text-muted-foreground">{userEntry.user_name}</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="font-bold">{userEntry.score}/360</span>
            <span className="text-muted-foreground">{userEntry.accuracy}%</span>
            <span className="text-muted-foreground">{formatTime(userEntry.time_taken)}</span>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No results yet. Be the first to take a mock test!
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Rank</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-right">Score</th>
                <th className="p-3 text-right">Accuracy</th>
                <th className="p-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr
                  key={entry.user_id}
                  className={`border-t transition-colors ${getRankStyle(entry.rank)} ${
                    entry.user_id === user?.id ? "font-semibold" : ""
                  }`}
                >
                  <td className="p-3">{getRankIcon(entry.rank)}</td>
                  <td className="p-3">
                    {entry.user_name}
                    {entry.user_id === user?.id && (
                      <span className="ml-2 text-xs text-primary">(You)</span>
                    )}
                  </td>
                  <td className="p-3 text-right">{entry.score}/360</td>
                  <td className="p-3 text-right">{entry.accuracy}%</td>
                  <td className="p-3 text-right">{formatTime(entry.time_taken)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}