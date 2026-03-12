/**
 * Generate a fingerprint-based device ID for the current browser
 * Uses localStorage to persist devices across sessions
 */

export function generateDeviceFingerprint(): string {
  // in a real app, use navigator.hardware, useragent, etc
  // for now use browser UA + random seed stored in localStorage
  const storedId = localStorage.getItem("neet_device_id");
  if (storedId) {
    return storedId;
  }

  const fingerprint = `${navigator.userAgent}_${Date.now()}_${Math.random().toString(36)}`;
  const hash = simpleHash(fingerprint);
  localStorage.setItem("neet_device_id", hash);
  return hash;
}

/**
 * Simple hash function for device fingerprint (not cryptographically secure)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
