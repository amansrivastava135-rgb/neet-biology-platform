/**
 * Centralized pricing configuration for NEET Biology Platform
 * All pricing UI and backend logic should reference this config
 */
export const PRICING = {
  crash: {
    id: "crash",
    price: 299,
    currency: "INR",
    durationDays: 30,
    label: "30 Days Access",
    description: "NEET Final 30 Days Crash Pack",
    displayText: "Last 30 days intensive preparation",
  },
  sixMonth: {
    id: "sixMonth",
    price: 599,
    currency: "INR",
    durationDays: 180,
    label: "6 Months Access",
    description: "Complete NEET Biology preparation for 6 months",
    displayText: "6 months of unlimited access",
  },
  premium: {
    id: "premium",
    price: 999,
    originalPrice: 2499,
    currency: "INR",
    durationDays: 365,
    label: "1 Year Access",
    description: "Complete NEET Biology preparation access for 1 year",
    displayText: "Unlimited access for 12 months",
    savings: 1500,
  },
};

export type PlanId = keyof typeof PRICING;

/**
 * Helper to get plan by id
 */
export const getPlanById = (id: string) => {
  return Object.values(PRICING).find((p) => p.id === id) || PRICING.premium;
};

/**
 * Helper function to calculate subscription end date
 */
export const calculateSubscriptionEnd = (
  startDate: Date = new Date(),
  durationDays: number = PRICING.premium.durationDays
): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate;
};

/**
 * Helper function to check if subscription is still valid
 */
export const isSubscriptionValid = (subscriptionEnd: Date): boolean => {
  return new Date() <= subscriptionEnd;
};

/**
 * Helper function to check if subscription expires soon (within 7 days)
 */
export const isSubscriptionExpiringSoon = (subscriptionEnd: Date): boolean => {
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return subscriptionEnd <= sevenDaysFromNow && subscriptionEnd > today;
};