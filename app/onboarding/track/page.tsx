"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Track options ────────────────────────────────────────────────────────────

const TRACKS = [
  {
    id: "class11",
    emoji: "📘",
    label: "Class 11 Student",
    description: "Currently in Class 11 — start from Unit 1 and build a strong foundation",
    chapters: "Chapters 1–22",
    color: "border-blue-400 bg-blue-50 hover:border-blue-500",
    selectedColor: "border-blue-500 bg-blue-100 ring-2 ring-blue-400",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "class12",
    emoji: "📗",
    label: "Class 12 Student",
    description: "Currently in Class 12 — focus on Class 12 chapters first, then revise Class 11",
    chapters: "Chapters 23–38 first",
    color: "border-green-400 bg-green-50 hover:border-green-500",
    selectedColor: "border-green-500 bg-green-100 ring-2 ring-green-400",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: "dropper",
    emoji: "🎯",
    label: "Dropper / Repeater",
    description: "Appeared for NEET before — intensive revision across all 38 chapters",
    chapters: "All 38 chapters · faster pace",
    color: "border-purple-400 bg-purple-50 hover:border-purple-500",
    selectedColor: "border-purple-500 bg-purple-100 ring-2 ring-purple-400",
    badgeColor: "bg-purple-100 text-purple-700",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function TrackSelectorContent() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selected || !user) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/guided-plan/set-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track: selected }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to save track. Please try again.");
        setSaving(false);
        return;
      }

      // Update local user state so dashboard sees the track immediately
      await updateUser({ ...user, track: selected as any });

      router.push("/dashboard?onboarding=1");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">

      {/* Header */}
      <div className="text-center mb-10 max-w-lg">
        <div className="text-4xl mb-3">🗺️</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Choose Your Study Track
        </h1>
        <p className="text-muted-foreground text-base">
          Your Guided Plan will be personalised based on your track.
          You can&apos;t change this later, so choose carefully.
        </p>
      </div>

      {/* Track cards */}
      <div className="w-full max-w-2xl space-y-4 mb-8">
        {TRACKS.map((track) => {
          const isSelected = selected === track.id;
          return (
            <button
              key={track.id}
              onClick={() => setSelected(track.id)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-150
                ${isSelected ? track.selectedColor : track.color}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl leading-none mt-0.5">{track.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-base font-semibold text-foreground">
                      {track.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${track.badgeColor}`}>
                      {track.chapters}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{track.description}</p>
                </div>
                {/* Selection indicator */}
                <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0
                  ${isSelected ? "border-current bg-current" : "border-gray-300"}`}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
      )}

      {/* Confirm button */}
      <Button
        size="lg"
        className="w-full max-w-2xl"
        disabled={!selected || saving}
        onClick={handleConfirm}
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Setting up your plan...
          </>
        ) : (
          "Confirm & Start My Guided Plan →"
        )}
      </Button>

      <p className="text-xs text-muted-foreground mt-4 text-center max-w-sm">
        Your daily tasks, chapter progression, and mock schedule will be
        automatically set based on this selection.
      </p>
    </div>
  );
}

export default function TrackSelectorPage() {
  return (
    <AuthProvider>
      <TrackSelectorContent />
    </AuthProvider>
  );
}
