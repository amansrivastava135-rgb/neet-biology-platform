/**
 * Centralized pricing configuration for NEET Biology Platform
 * All pricing UI and backend logic should reference this config
 */

export const PRICING = {
  premium: {
    price: 499,
    currency: "INR",
    durationDays: 365,
    label: "1 Year Access",
    description: "Complete NEET preparation access for 1 year",
    displayText: "Unlimited access for 12 months",
  },
};

/**
 * Helper function to calculate subscription end date
 * @param startDate - The subscription start date (defaults to today)
 * @returns The subscription end date (365 days from start)
 */
export const calculateSubscriptionEnd = (startDate: Date = new Date()): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + PRICING.premium.durationDays);
  return endDate;
};

/**
 * Helper function to check if subscription is still valid
 * @param subscriptionEnd - The subscription end date
 * @returns true if subscription is still active, false if expired
 */
export const isSubscriptionValid = (subscriptionEnd: Date): boolean => {
  return new Date() <= subscriptionEnd;
};

/**
 * Helper function to check if subscription expires soon (within 7 days)
 * @param subscriptionEnd - The subscription end date
 * @returns true if subscription expires within 7 days
 */
export const isSubscriptionExpiringSoon = (subscriptionEnd: Date): boolean => {
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return subscriptionEnd <= sevenDaysFromNow && subscriptionEnd > today;
};
