/**
 * Premium Access Guard Component
 * Prevents non-premium users from accessing paid features
 * Automatically redirects expired users to pricing page
 * Enforces 1-year subscription expiration checks
 */

"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  isSubscriptionActive, 
  validateAndUpdateSubscription,
  isSubscriptionExpiringsoon,
  getRemainingDays,
  formatSubscriptionExpiry 
} from "@/lib/subscription-utils";
import { isPremium } from "@/lib/checkPremium";
import { AlertCircle } from "lucide-react";

interface PremiumGuardProps {
  children: ReactNode;
  requiresPremium?: boolean;
  fallback?: ReactNode;
}

export function PremiumGuard({ children, requiresPremium = true, fallback }: PremiumGuardProps) {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [validatedUser, setValidatedUser] = useState(user);

  // Validate subscription on mount and when user changes
  useEffect(() => {
    if (user) {
      const validated = validateAndUpdateSubscription(user);
      if (validated.subscription !== user.subscription || validated.isPaid !== user.isPaid) {
        // Subscription status changed, update context
        updateUser(validated);
      }
      setValidatedUser(validated);
    }
  }, [user, updateUser]);

  if (!validatedUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">Please log in</h2>
        <p className="text-muted-foreground">
          You need to be logged in to access this feature.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!requiresPremium) {
    return <>{children}</>;
  }

  const isPremiumUser = isPremium(validatedUser);

  if (!isPremiumUser) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">Upgrade to Premium to access this feature.</h2>
        <p className="text-muted-foreground">
          This feature is only available for premium members.
        </p>
        {validatedUser.subscription === "expired" && (
          <p className="text-amber-600 font-semibold">
            Your subscription expired on {formatSubscriptionExpiry(validatedUser)}.
          </p>
        )}
        <button
          onClick={() => router.push("/pricing")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          View Pricing Plans
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Subscription Warning Banner
 * Shows when subscription is expiring within 7 days
 * Enforces user awareness of upcoming expiration
 */
export function SubscriptionWarningBanner() {
  const { user } = useAuth();

  if (!user || !isSubscriptionExpiringsoon(user)) {
    return null;
  }

  const remainingDays = getRemainingDays(user);
  const expiryDate = formatSubscriptionExpiry(user);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-900">Subscription Expiring Soon</p>
        <p className="text-sm text-amber-800">
          Your 1-year subscription expires in {remainingDays} day{remainingDays !== 1 ? "s" : ""} ({expiryDate}).
          <a href="/pricing" className="underline ml-1 font-semibold hover:text-amber-700">
            Renew now
          </a>
        </p>
      </div>
    </div>
  );
}
