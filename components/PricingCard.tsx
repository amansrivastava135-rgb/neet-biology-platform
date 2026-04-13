import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { PRICING } from "@/lib/pricing-config";

type PricingCardProps = {
  plan: "free" | "crash" | "sixMonth" | "premium";
  features: Array<{ name: string; included: boolean | string }>;
  userIsPaid?: boolean;
  userLoggedIn?: boolean;
  onBuy?: (planId: string) => void;
  compact?: boolean;
};

export function PricingCard({
  plan,
  features,
  userIsPaid,
  userLoggedIn,
  onBuy,
  compact = false,
}: PricingCardProps) {
  const isPremium = plan === "premium";
  const isCrash = plan === "crash";
  const isSixMonth = plan === "sixMonth";
  const isFree = plan === "free";

  const planData = isFree ? null : PRICING[plan as keyof typeof PRICING];

  const priceLabel = isFree
    ? "Rs.0"
    : isPremium
    ? `₹${PRICING.premium.price}`
    : isCrash
    ? `₹${PRICING.crash.price}`
    : `₹${PRICING.sixMonth.price}`;

  const periodLabel = isFree
    ? "/forever"
    : isPremium
    ? PRICING.premium.label
    : isCrash
    ? PRICING.crash.label
    : PRICING.sixMonth.label;

  const description = isFree
    ? "Try before you commit"
    : isPremium
    ? PRICING.premium.description
    : isCrash
    ? PRICING.crash.description
    : PRICING.sixMonth.description;

  const title = isFree
    ? "Free"
    : isPremium
    ? "Yearly Plan"
    : isCrash
    ? "Crash Pack"
    : "6 Month Plan";

  return (
    <Card
      className={`relative ${
        isPremium
          ? "border-primary shadow-lg"
          : isCrash
          ? "border-orange-400 shadow-md"
          : "border-border"
      }`}
    >
      {isPremium && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      {isCrash && (
        <Badge
          className="absolute -top-3 left-1/2 -translate-x-1/2"
          variant="destructive"
        >
          Limited Time Offer
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>

        <div className="mt-4">
          {/* Yearly plan — strikethrough original price */}
          {isPremium && (
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg text-muted-foreground line-through">
                ₹{PRICING.premium.originalPrice}
              </span>
              <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                Save ₹{PRICING.premium.savings}
              </Badge>
            </div>
          )}

          <span className="text-4xl font-bold text-foreground">{priceLabel}</span>
          <span className="block text-sm text-muted-foreground mt-1">{periodLabel}</span>

          {/* Crash pack validity */}
          {isCrash && (
            <span className="block text-xs text-orange-600 font-medium mt-1">
              Valid Till NEET Exam
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature.name} className="flex items-center gap-3">
              {feature.included ? (
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <span
                className={feature.included ? "text-foreground" : "text-muted-foreground"}
              >
                {feature.name}
              </span>
            </li>
          ))}
        </ul>

        {isFree ? (
          userLoggedIn ? (
            <Button className="w-full" variant="outline" asChild>
              <Link href="/practice">Start Practicing</Link>
            </Button>
          ) : (
            <Button className="w-full" variant="outline" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          )
        ) : userIsPaid ? (
          <Button className="w-full" disabled>
            ✅ Already Subscribed
          </Button>
        ) : (
          <Button
            className={`w-full ${isCrash ? "bg-orange-500 hover:bg-orange-600 text-white border-0" : ""}`}
            variant={isPremium ? "default" : "outline"}
            onClick={() => onBuy?.(plan)}
          >
            {isCrash
              ? "Buy Crash Pack — ₹299"
              : isPremium
              ? "Buy Yearly — ₹999"
              : "Buy 6 Months — ₹599"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}