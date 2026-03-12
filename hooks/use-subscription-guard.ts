import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { generateDeviceFingerprint } from "@/lib/device-fingerprint";
import { isSubscriptionActive, addDevice } from "@/lib/subscription-utils";

/**
 * Hook to manage device registration and subscription validation
 * Ensures:
 * 1. User is logged in
 * 2. Subscription is still valid
 * 3. Device is registered (max 2 devices)
 */
export function useSubscriptionGuard(requirePremium: boolean = true) {
  const { user, isLoading, updateUser } = useAuth();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAccess = async () => {
      // 1. Check if user is logged in
      if (!user) {
        setError("Please log in first");
        setIsValid(false);
        return;
      }

      // 2. Check subscription if premium access required
      if (requirePremium && !isSubscriptionActive(user)) {
        setError("Your subscription has expired. Please renew to continue.");
        setIsValid(false);
        return;
      }

      // 3. Generate and register device ID
      const fingerprint = generateDeviceFingerprint();
      setDeviceId(fingerprint);

      // 4. Check device limit (max 2 devices)
      const devices = user.devices || [];
      if (!devices.includes(fingerprint) && devices.length >= 2) {
        // device limit reached - could block or remove oldest
        // for now we'll allow with warning
        console.warn("Device limit reached. Oldest device may be logged out.");
      }

      // 5. Register device if not already registered
      if (!devices.includes(fingerprint)) {
        const updatedDevices = addDevice(user, fingerprint, 2);
        updateUser({ ...user, devices: updatedDevices });
      }

      setIsValid(true);
      setError(null);
    };

    if (!isLoading) {
      checkAccess();
    }
  }, [user, isLoading, requirePremium, updateUser]);

  return {
    isValid,
    error,
    deviceId,
    user,
    requirePremium,
  };
}

/**
 * Hook to manage active test sessions
 * Ensures only one test can run per account at a time
 */
export function useTestSession(testType: "full" | "preview" | "chapter" | "practice") {
  const { user } = useAuth();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // start session on mount if user is logged in
  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const startSession = async () => {
      setLoading(true);
      try {
        const fingerprint = generateDeviceFingerprint();
        setDeviceId(fingerprint);

        const res = await fetch("/api/test/active-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            deviceId: fingerprint,
            testType,
          }),
        }).then((r) => r.json());

        if (res.success) {
          setSessionId(res.sessionId);
        }
      } catch (err) {
        console.error("Error starting test session", err);
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [user, testType]);

  // end session on cleanup
  const endSession = async () => {
    if (!sessionId) return;

    try {
      await fetch("/api/test/active-session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.error("Error ending test session", err);
    }
  };

  return {
    sessionId,
    deviceId,
    loading,
    endSession,
  };
}
