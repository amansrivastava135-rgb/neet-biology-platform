import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { PRICING } from "@/lib/pricing-config";

type PromoResult = {
  code: string;
  discountAmount: number;
  finalPrice: number;
  originalPrice: number;
  message: string;
  planId: string;
};

type PricingCardProps = {
  plan: "free" | "crash" | "sixMonth" | "premium";
  features: Array<{ name: string; included: boolean | string }>;
  userIsPaid?: boolean;
  userLoggedIn?: boolean;
  onBuy?: (planId: string) => void;
  promoResult?: PromoResult;
};

export function PricingCard({
  plan,
  features,
  userIsPaid,
  userLoggedIn,
  onBuy,
  promoResult,
}: PricingCardProps) {
  const isPremiumPlan = plan === "premium";
  const isCrash = plan === "crash";
  const isSixMonth = plan === "sixMonth";
  const isFree = plan === "free";

  const planData = isFree ? null : PRICING[plan as keyof typeof PRICING];
  const basePrice = planData?.price || 0;

  // Promo valid for this specific plan
  const promoValid = promoResult && promoResult.discountAmount > 0;
  const displayPrice = promoValid ? promoResult!.finalPrice : basePrice;

  const periodLabel = isFree
    ? "/forever"
    : isPremiumPlan
    ? PRICING.premium.label
    : isCrash
    ? PRICING.crash.label
    : PRICING.sixMonth.label;

  const description = isFree
    ? "Try before you commit"
    : isPremiumPlan
    ? PRICING.premium.description
    : isCrash
    ? PRICING.crash.description
    : PRICING.sixMonth.description;

  const title = isFree
    ? "Free"
    : isPremiumPlan
    ? "Yearly Plan"
    : isCrash
    ? "Crash Pack"
    : "6 Month Plan";

  return (
    <Card
      className={`relative ${
        isPremiumPlan
          ? "border-primary shadow-lg"
          : isCrash
          ? "border-orange-400 shadow-md"
          : "border-border"
      }`}
    >
      {isPremiumPlan && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
      )}
      {isCrash && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="destructive">
          Limited Time Offer
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>

        <div className="mt-4">
          {/* Yearly original price strikethrough — no promo */}
          {isPremiumPlan && !promoValid && (
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg text-muted-foreground line-through">
                ₹{PRICING.premium.originalPrice}
              </span>
              <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                Save ₹{PRICING.premium.savings}
              </Badge>
            </div>
          )}

          {/* Promo applied — show original strikethrough + discount badge */}
          {promoValid && (
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg text-muted-foreground line-through">₹{basePrice}</span>
              <Badge variant="secondary" className="text-xs text-green-700 bg-green-100">
                {promoResult!.message}
              </Badge>
            </div>
          )}

          {isFree ? (
            <span className="text-4xl font-bold text-foreground">Free</span>
          ) : (
            <span className="text-4xl font-bold text-foreground">₹{displayPrice}</span>
          )}
          <span className="block text-sm text-muted-foreground mt-1">{periodLabel}</span>

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
              <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
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
            Already Subscribed
          </Button>
        ) : (
          <Button
            className={`w-full ${isCrash ? "bg-orange-500 hover:bg-orange-600 text-white border-0" : ""}`}
            variant={isPremiumPlan ? "default" : "outline"}
            onClick={() => onBuy?.(plan)}
          >
            {isCrash
              ? `Buy Crash Pack — ₹${displayPrice}`
              : isPremiumPlan
              ? `Buy Yearly — ₹${displayPrice}`
              : `Buy 6 Months — ₹${displayPrice}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}