import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { PRICING } from "@/lib/pricing-config";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Try before you buy",
    features: [
      { text: "10 Demo Questions", included: true },
      { text: "Mock Test Preview", included: true },
      { text: "Limited Chapter Access", included: true },
      { text: "All Chapters Unlocked", included: false },
      { text: "Full Mock Tests", included: false },
      { text: "Performance Analytics", included: false },
    ],
    cta: "Get Started Free",
    href: "/signup",
    popular: false,
  },
  {
    name: "Premium",
    price: PRICING.premium.price.toString(),
    period: PRICING.premium.label,
    description: PRICING.premium.description,
    features: [
      { text: "All 38 Chapters", included: true },
      { text: "3800+ MCQs", included: true },
      { text: "NEET PYQs (2010-2024)", included: true },
      { text: "Unlimited Mock Tests", included: true },
      { text: "Detailed Analytics", included: true },
      { text: "Weak Chapter Analysis", included: true },
    ],
    cta: "Start Premium",
    href: "/pricing",
    popular: true,
  },

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`border-border relative ${
                plan.popular ? "border-primary shadow-lg" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price === "0" ? "Free" : `₹${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="block text-sm text-muted-foreground mt-1">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
