import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">

        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <BookOpen className="h-9 w-9 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>

        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          Oops! This page does not exist. The link may be incorrect or the page has been removed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/practice">Start Practicing</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}