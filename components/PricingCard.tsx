import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { PRICING } from "@/lib/pricing-config";

type PricingCardProps = {
  plan: "free" | "premium";
  features: Array<{ name: string; included: boolean | string }>;
  userIsPaid?: boolean;
  onBuy?: () => void;
};

export function PricingCard({ plan, features, userIsPaid, onBuy }: PricingCardProps) {
  const isPremium = plan === "premium";
  const priceLabel = isPremium ? `₹${PRICING.premium.price}` : "Rs.0";
  const periodLabel = isPremium ? PRICING.premium.label : "/forever";

  return (
    <Card className={isPremium ? "border-primary shadow-lg" : "border-border"}>
      {isPremium && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
      )}
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">{isPremium ? "Premium" : "Free"}</CardTitle>
        <CardDescription>{isPremium ? PRICING.premium.description : "Try before you commit"}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-foreground">{priceLabel}</span>
          <span className="block text-sm text-muted-foreground mt-1">{periodLabel}</span>
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
        {isPremium ? (
          userIsPaid ? (
            <Button className="w-full" disabled>Already Subscribed</Button>
          ) : (
            <Button className="w-full" onClick={onBuy}>Buy Now</Button>
          )
        ) : (
          <Button className="w-full" variant="outline" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
