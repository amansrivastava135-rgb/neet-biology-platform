import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { isSubscriptionActive } from "@/lib/subscription-utils";

interface SubscriptionGuardProps {
  children: ReactNode;
  requiresPremium?: boolean;
  fallbackUrl?: string;
}

/**
 * Component to guard premium pages behind subscription check
 * Redirects expired users to pricing or fallback URL
 */
export function SubscriptionGuard({
  children,
  requiresPremium = true,
  fallbackUrl = "/pricing",
}: SubscriptionGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // free users can access everything in this implementation
    // but check subscription for premium features
    if (requiresPremium && user) {
      if (!isSubscriptionActive(user)) {
        // subscription expired or invalid
        router.push(fallbackUrl);
        return;
      }
    }

    setCanRender(true);
  }, [user, isLoading, requiresPremium, router, fallbackUrl]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (requiresPremium && !isSubscriptionActive(user)) {
    // will redirect, show nothing
    return null;
  }

  if (!canRender) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook version that returns guard status without rendering
 */
export function useSubscriptionCheck(requiresPremium: boolean = true) {
  const { user, isLoading } = useAuth();
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (requiresPremium && user) {
      setIsProtected(isSubscriptionActive(user));
    } else {
      setIsProtected(true);
    }
  }, [user, isLoading, requiresPremium]);

  return {
    isProtected,
    isLoading,
    user,
  };
}
