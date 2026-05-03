import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { PRICING } from "@/lib/pricing-config";

const freePlanFeatures = [
  { text: "10 Demo Questions", included: true },
  { text: "Mock Test Preview", included: true },
  { text: "Limited Chapter Access", included: true },
  { text: "All Chapters Unlocked", included: false },
  { text: "Full Mock Tests", included: false },
  { text: "Performance Analytics", included: false },
];

const premiumFeatures = [
  { text: "All 38 Chapters", included: true },
  { text: "3800+ MCQs", included: true },
  { text: "NEET PYQs (2010-2024)", included: true },
  { text: "Unlimited Mock Tests", included: true },
  { text: "Detailed Analytics", included: true },
  { text: "Weak Chapter Analysis", included: true },
];

export function PricingPreview() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Simple, Affordable Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get complete access to all features for less than the cost of a coffee per day
          </p>
        </div>

        {/* Free + Premium cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-6">
          {/* Free */}
          <Card className="border-border relative">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Preview Only</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">Free</span>
                <span className="block text-sm text-muted-foreground mt-1">/forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {freePlanFeatures.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    {f.included ? (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Premium */}
          <Card className="border-primary shadow-lg relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Most Popular
            </Badge>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Yearly Plan</CardTitle>
              <CardDescription>{PRICING.premium.description}</CardDescription>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{PRICING.premium.originalPrice}
                  </span>
                  <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                    Save ₹{PRICING.premium.savings}
                  </Badge>
                </div>
                <span className="text-4xl font-bold text-foreground">
                  ₹{PRICING.premium.price}
                </span>
                <span className="block text-sm text-muted-foreground mt-1">
                  {PRICING.premium.label}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link href="/pricing">Start Premium</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* See all plans link */}
        <div className="text-center">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground underline">
            View all plans including 6 Month plan →
          </Link>
        </div>
      </div>
    </section>
  );
}