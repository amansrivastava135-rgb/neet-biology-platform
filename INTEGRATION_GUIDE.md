import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isSubscriptionActive, getRemainingDays } from "@/lib/subscription-utils";

/**
 * EXAMPLE: How to protect pages with subscription guard
 * Pattern for use in mock-test/page.tsx, dashboard/page.tsx, etc.
 */

// Option 1: Using the guard component
export function MockTestPageProtected({ children }: { children: ReactNode }) {
  return (
    <SubscriptionGuard requiresPremium={true}>
      {children}
    </SubscriptionGuard>
  );
}

// Option 2: Using the hook (more flexible)
export function DashboardPageProtected() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (!isSubscriptionActive(user)) {
    router.push("/pricing");
    return null;
  }

  const remainingDays = getRemainingDays(user);

  return (
    <div>
      {remainingDays < 30 && (
        <div className="bg-yellow-100 p-4 mb-4">
          Your subscription expires in {remainingDays} days.
          <a href="/pricing">Renew now</a>
        </div>
      )}
      <div>Your Premium Dashboard</div>
    </div>
  );
}

// Option 3: For test sessions (ensure one test per user)
export function MockTestInterfaceWithSession() {
  const { sessionId, endSession } = useTestSession("full");

  // sessionId will be auto-generated and stored
  // if user starts a test on another device, this session auto-terminates

  // On component cleanup:
  // useEffect(() => {
  //   return () => endSession();
  // }, [sessionId, endSession]);

  return <div>Test interface with active session: {sessionId}</div>;
}

/**
 * INTEGRATION POINTS
 */

/**
 * 1. Protected pages should wrap content in:
 *
 *   <SubscriptionGuard requiresPremium={true}>
 *     <YourContent />
 *   </SubscriptionGuard>
 *
 * Files to update:
 * - app/mock-test/page.tsx
 * - app/dashboard/page.tsx
 * - app/practice/page.tsx
 */

/**
 * 2. Test pages should use:
 *
 *   const { sessionId } = useTestSession("full");
 *
 * Files to update:
 * - components/test-engine/TestEngine.tsx
 */

/**
 * 3. Check subscription in conditionals:
 *
 *   if (isSubscriptionActive(user)) {
 *     // show premium features
 *   }
 *
 * Import from: @/lib/subscription-utils
 */

/**
 * 4. Show remaining days:
 *
 *   const days = getRemainingDays(user);
 *   if (days < 30) {
 *     // show renewal reminder
 *   }
 */
