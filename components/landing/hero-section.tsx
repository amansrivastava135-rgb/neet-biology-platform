"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Target, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/20" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">

          {/* Guided Plan badge — non-logged-in users ko dikhega */}
          {!user && (
            <div className="mb-6 flex justify-center">
              <Link href="/pricing">
                <Badge
                  variant="secondary"
                  className="gap-2 px-4 py-1.5 text-sm font-medium cursor-pointer hover:bg-primary/10 transition-colors border border-primary/20"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  New: Guided NEET Plan — ₹1299/year
                  <ArrowRight className="h-3 w-3" />
                </Badge>
              </Link>
            </div>
          )}

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Crack{" "}
            <span
              className="text-primary"
              style={{ textTransform: "uppercase", letterSpacing: "0.01em" }}
            >
              Neet Biology
            </span>{" "}
            with NCERT + PYQs + Mock Tests
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Structured chapter-wise practice with 3800+ MCQs, Previous Year Questions
            (2010–2025), full-length mock tests, and performance analytics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Button size="lg" asChild className="gap-2 w-full sm:w-auto">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="gap-2 w-full sm:w-auto">
                  <Link href="/signup">
                    Start Practicing Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto gap-2"
                >
                  <Link href="/pricing">
                    <Sparkles className="h-4 w-4 text-primary" />
                    View Plans
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Guided Plan highlight — non-logged-in users ke liye */}
          {!user && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/15 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <span>
                Want a structured study plan?{" "}
                <Link
                  href="/pricing"
                  className="text-primary font-medium hover:underline"
                >
                  Try our Guided NEET Plan →
                </Link>
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">38</p>
              <p className="text-sm text-muted-foreground">Chapters</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">3800+</p>
              <p className="text-sm text-muted-foreground">MCQs</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">15+</p>
              <p className="text-sm text-muted-foreground">Mock Tests</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">2010–2025</p>
              <p className="text-sm text-muted-foreground">PYQs Coverage</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}