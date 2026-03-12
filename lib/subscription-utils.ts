import { User } from "./auth-context";

/**
 * Check if a subscription is currently active
 */
export function isSubscriptionActive(user: User | null): boolean {
  if (!user) return false;
  if (!user.subscription || user.subscription !== "active") return false;
  if (!user.subscription_end) return false;
  
  const now = new Date();
  const endDate = new Date(user.subscription_end);
  return now.getTime() < endDate.getTime();
}

/**
 * Get remaining days in subscription
 */
export function getRemainingDays(user: User | null): number {
  if (!user || !user.subscription_end) return 0;
  const now = new Date();
  const endDate = new Date(user.subscription_end);
  const diffMs = endDate.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
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
  end.setDate(end.getDate() + 365);
  return end.toISOString();
}
