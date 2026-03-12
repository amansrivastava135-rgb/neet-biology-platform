"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileQuestion, Lock, Play, Sparkles, Target, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getRemainingDays } from "@/lib/subscription-utils";
import { useAuth } from "@/lib/auth-context";

type MockTestSelectorProps = {
  onStartTest: (type: "full" | "preview") => void;
  isPaidUser: boolean;
};

export function MockTestSelector({ onStartTest, isPaidUser }: MockTestSelectorProps) {
  const { user } = useAuth();
  const remainingDays = user ? getRemainingDays(user) : 0;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">NEET Mock Tests</h1>
        <p className="text-muted-foreground">
          Practice with full-length NEET pattern tests to build exam temperament
        </p>
        {isPaidUser && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant="secondary">Premium Active</Badge>
            {remainingDays > 0 && (
              <span className="text-sm text-muted-foreground">
                {remainingDays} days remaining
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Preview Test */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Free Preview</Badge>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-xl mt-4">Demo Mock Test</CardTitle>
            <CardDescription>
              Get a taste of the NEET exam experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileQuestion className="h-4 w-4" />
                <span>10 Questions</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>10 Minutes</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>Mixed Topics</span>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- Sample questions from NEET pattern</li>
              <li>- Instant score calculation</li>
              <li>- Basic performance feedback</li>
            </ul>
            <Button className="w-full gap-2" onClick={() => onStartTest("preview")}>
              <Play className="h-4 w-4" />
              Start Demo Test
            </Button>
          </CardContent>
        </Card>

        {/* Full Mock Test */}
        <Card className={`border-border ${!isPaidUser ? "opacity-75" : ""}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="default">Premium</Badge>
              {!isPaidUser && <Lock className="h-5 w-5 text-muted-foreground" />}
            </div>
            <CardTitle className="text-xl mt-4">Full NEET Mock Test</CardTitle>
            <CardDescription>
              Complete NEET exam simulation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileQuestion className="h-4 w-4" />
                <span>180 Questions</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>3 Hours</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span>Biology Only</span>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>- NEET exam pattern</li>
              <li>- Auto submission after time</li>
              <li>- Detailed analytics & review</li>
            </ul>
            {isPaidUser ? (
              <Button className="w-full gap-2" onClick={() => onStartTest("full")}>
                <Play className="h-4 w-4" />
                Start Full Test
              </Button>
            ) : (
              <Button className="w-full gap-2" variant="secondary" asChild>
                <Link href="/pricing">
                  <Lock className="h-4 w-4" />
                  Unlock with Premium
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Instructions */}
      <Card className="max-w-4xl mx-auto mt-8 border-border">
        <CardHeader>
          <CardTitle className="text-lg">Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">1.</span>
              Ensure you have a stable internet connection before starting the test.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">2.</span>
              Each question has 4 options. Select one option for each question.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">3.</span>
              You can mark questions for review and come back to them later.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">4.</span>
              The test will auto-submit when the timer runs out.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-foreground">5.</span>
              Marking scheme: +4 for correct, -1 for incorrect, 0 for unattempted.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Available Tests */}
      {isPaidUser && (
        <div className="max-w-4xl mx-auto mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Available Mock Tests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <Card key={num} className="border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Mock Test {num}</span>
                    <Badge variant="outline">180 Qs</Badge>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => onStartTest("full")}
                  >
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
