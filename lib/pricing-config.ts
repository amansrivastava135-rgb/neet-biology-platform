/**
 * Centralized pricing configuration for NEET Biology Platform
 * All pricing UI and backend logic should reference this config
 */
export const PRICING = {
  trial: {
    id: "trial",
    price: 29,
    currency: "INR",
    durationDays: 5,
    label: "5 Day Trial",
    description: "NEET Biology 5-Day Premium Trial",
    displayText: "5 days of premium access",
    maxChapters: 5,
    maxMockTests: 3,
    hasDaily10Q: true,
    hasMiniMock: true,
    miniMockQuestions: 25,
    miniMockMaxUses: 2, // Day 1 + Day 4 only
  },
  monthly: {
    id: "monthly",
    price: 249,
    currency: "INR",
    durationDays: 30,
    label: "30 Days Access",
    description: "NEET Biology 30 Days Plan",
    displayText: "30 days intensive preparation",
    hasDaily10Q: true,
    hasMiniMock: false,
  },
  sixMonth: {
    id: "sixMonth",
    price: 599,
    currency: "INR",
    durationDays: 180,
    label: "6 Months Access",
    description: "Complete NEET Biology preparation for 6 months",
    displayText: "6 months of unlimited access",
    hasDaily10Q: true,
    hasMiniMock: false,
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
    hasDaily10Q: true,
    hasMiniMock: true,
    miniMockQuestions: 25,
    miniMockMaxUses: null, // unlimited
  },
  guided: {
    id: "guided",
    price: 1299,
    originalPrice: 2999,
    currency: "INR",
    durationDays: 365,
    label: "Guided Plan (1 Year)",
    description: "NEET Biology Guided Preparation Plan",
    displayText: "Complete guided prep for 12 months",
    savings: 1700,
    hasDaily10Q: true,
    hasMiniMock: true,
    miniMockQuestions: 25,
    miniMockMaxUses: null, // unlimited
    isGuided: true,
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

// Trial helpers
export const isTrial = (planId?: string) => planId === "trial";
export const TRIAL_MAX_CHAPTERS = 5;
export const TRIAL_MAX_MOCK_TESTS = 3;
export const TRIAL_MINI_MOCK_MAX_USES = 2;