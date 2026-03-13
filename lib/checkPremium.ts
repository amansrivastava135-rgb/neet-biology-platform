import { User } from "@/lib/auth-context";

export function isPremium(user?: User | null) {
  if (!user) return false;

  const endDateString = user.subscriptionEnd || user.subscription_end;
  if (!endDateString) return false;

  const endDate = new Date(endDateString);
  if (Number.isNaN(endDate.getTime())) return false;

  const now = new Date();
  const premiumPlan = user.subscriptionPlan === "premium" || user.plan === "premium" || user.subscription === "active";

  return premiumPlan && endDate.getTime() > now.getTime();
}
