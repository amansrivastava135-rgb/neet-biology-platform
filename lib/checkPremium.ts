import { User } from "@/lib/auth-context";

export function isPremium(user?: User | null): boolean {
  if (!user) return false;

  // isPaid false hai toh seedha return
  if (!user.isPaid) return false;

  const endDateString = user.subscriptionEnd || user.subscription_end;

  // Agar koi end date nahi — isPaid true hai toh allow karo
  if (!endDateString) return user.isPaid === true;

  const endDate = new Date(endDateString);
  if (Number.isNaN(endDate.getTime())) return false;

  // Date valid hai — check karo expire hua ya nahi
  if (endDate.getTime() <= Date.now()) return false;

  // Plan check — trial, monthly, sixMonth, premium sab valid hain
  const validPlans = ["premium", "monthly", "sixMonth", "trial"];
  const planValid =
    validPlans.includes(user.subscriptionPlan || "") ||
    validPlans.includes(user.plan || "") ||
    user.subscription === "active";

  return planValid;
}
export const TRIAL_MAX_CHAPTERS = 5;

export function isTrial(user?: User | null): boolean {
  if (!user || !user.isPaid) return false;
  return user.subscriptionPlan === "trial" || user.plan === "trial";
}
