import { User } from "./auth-context";
import { PRICING, isSubscriptionValid, isSubscriptionExpiringSoon } from "./pricing-config";
import { isPremium } from "./checkPremium";

/**
 * Check if a subscription is currently active
 */
export function isSubscriptionActive(user: User | null): boolean {
  return isPremium(user);
}

/**
 * Validate subscription and update status if expired
 * Returns the user with updated subscription status
 */
export function validateAndUpdateSubscription(user: User): User {
  const end = user.subscriptionEnd || user.subscription_end;
  if (!end) return user;

  const isValid = isSubscriptionValid(new Date(end));

  if (!isValid && (user.subscriptionPlan === "premium" || user.subscription === "active")) {
    // Subscription has expired, downgrade to free
    return {
      ...user,
      subscriptionPlan: "free",
      subscription: "expired",
      isPaid: false,
    };
  }

  return user;
}

/**
 * Get remaining days in subscription
 */
export function getRemainingDays(user: User | null): number {
  const end = user?.subscriptionEnd || user?.subscription_end;
  if (!user || !end) return 0;
  const now = new Date();
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export function isSubscriptionExpiringsoon(user: User | null): boolean {
  const end = user?.subscriptionEnd || user?.subscription_end;
  if (!user || !end) return false;
  return isSubscriptionExpiringSoon(new Date(end));
}

/**
 * Format subscription expiry date as readable string
 */
export function formatSubscriptionExpiry(user: User | null): string {
  const end = user?.subscriptionEnd || user?.subscription_end;
  if (!user || !end) return "";
  const date = new Date(end);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Check if device is already registered for user
 */
export function isDeviceRegistered(user: User, deviceId: string): boolean {
  if (!user.devices) return false;
  return user.devices.includes(deviceId);
}

/**
 * Add device to user's device list, respecting limit of 2
 * Returns updated devices array
 */
export function addDevice(user: User, deviceId: string, maxDevices: number = 2): string[] {
  const devices = user.devices || [];
  
  if (devices.includes(deviceId)) {
    return devices; // already registered
  }
  
  if (devices.length >= maxDevices) {
    // remove oldest device
    devices.shift();
  }
  
  devices.push(deviceId);
  return devices;
}

/**
 * Calculate subscription end date (365 days from now)
 */
export function calculateSubscriptionEnd(): string {
  const end = new Date();
  end.setDate(end.getDate() + PRICING.premium.durationDays);
  return end.toISOString();
}
