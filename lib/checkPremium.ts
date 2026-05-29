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

  // Plan check — trial, monthly, sixMonth, premium, guided sab valid hain
  const validPlans = ["premium", "monthly", "sixMonth", "trial", "guided"];
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

/**
 * Daily 10Q access — all paid plans
 */
export function hasDaily10Q(user?: User | null): boolean {
  if (!isPremium(user)) return false;
  const plans = ["trial", "monthly", "sixMonth", "premium", "guided"];
  return plans.includes(user?.subscriptionPlan ?? user?.plan ?? "");
}

/**
 * Mini Mock access — trial, premium, guided only
 */
export function hasMiniMock(user?: User | null): boolean {
  if (!isPremium(user)) return false;
  const plans = ["trial", "premium", "guided"];
  return plans.includes(user?.subscriptionPlan ?? user?.plan ?? "");
}

/**
 * Guided plan check
 */
export function isGuided(user?: User | null): boolean {
  if (!isPremium(user)) return false;
  return user?.subscriptionPlan === "guided" || user?.plan === "guided";
}

/**
 * Returns max mini mock uses allowed.
 * null = unlimited (premium / guided)
 * 2    = trial only (Day 1 + Day 4)
 */
export function getMiniMockUseLimit(user?: User | null): number | null {
  if (isTrial(user)) return 2;
  return null; // unlimited for premium / guided
}
