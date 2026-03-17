"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type User = {
  id: string;
  email: string;
  name: string;
  // legacy boolean used throughout the UI for quick checks
  isPaid: boolean;
  // subscription details
  subscriptionPlan?: "free" | "premium" | "expired";
  subscriptionStart?: string; // ISO string
  subscriptionEnd?: string; // ISO string

  subscription?: "free" | "active" | "expired";
  plan?: string;
  expiryDate?: string; // ISO string (legacy)
  subscription_start?: string; // ISO string for 365-day subscription (legacy)
  subscription_end?: string; // ISO string (legacy)
  // device tracking to prevent account sharing
  devices?: string[];
  // active test session tracking
  activeTestSession?: {
    sessionId: string;
    startTime: string; // ISO string
    deviceId: string;
  };
  isAdmin: boolean;
  subscribedAt?: Date;
  expiresAt?: Date; // kept for backwards compatibility
};

export type UserProgress = {
  totalAttempted: number;
  totalCorrect: number;
  chapterProgress: Record<number, { attempted: number; correct: number }>;
};

type AuthContextType = {
  user: User | null;
  progress: UserProgress;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProgress: (chapterId: number, isCorrect: boolean) => void;
  // subscription helpers
  updateUser: (u: User) => void;
  activateSubscription: (plan: string, days: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// helpers for working with the new subscription schema
function migrateUser(u: User): User {
  // ensure subscription fields exist for older records
  const migrated = { ...u } as User;
  if (migrated.subscriptionPlan === undefined) {
    migrated.subscriptionPlan = migrated.plan === "premium" ? "premium" : migrated.isPaid ? "premium" : "free";
  }
  if (migrated.subscription === undefined) {
    migrated.subscription = migrated.isPaid ? "active" : "free";
  }
  if (migrated.expiryDate === undefined && migrated.expiresAt) {
    migrated.expiryDate = (migrated.expiresAt as Date).toISOString();
  }

  if (!migrated.subscriptionStart && migrated.subscription_start) {
    migrated.subscriptionStart = migrated.subscription_start;
  }
  if (!migrated.subscriptionEnd && migrated.subscription_end) {
    migrated.subscriptionEnd = migrated.subscription_end;
  }

  // Legacy 'expiryDate' should map to subscriptionEnd
  if (!migrated.subscriptionEnd && migrated.expiryDate) {
    migrated.subscriptionEnd = migrated.expiryDate;
  }

  // check if subscription has passed
  const now = new Date();
  if (migrated.subscriptionEnd) {
    const endDate = new Date(migrated.subscriptionEnd);
    if (now.getTime() > endDate.getTime()) {
      migrated.subscriptionPlan = "free";
      migrated.subscription = "expired";
      migrated.isPaid = false;
      return migrated;
    }
  }

  // still active
  migrated.isPaid = (migrated.subscriptionPlan === "premium" && migrated.subscriptionEnd ? new Date(migrated.subscriptionEnd).getTime() > Date.now() : false);

  return migrated;
}

function applySubscription(u: User, plan: string, days: number): User {
  const now = new Date();
  const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const updated: User = {
    ...u,
    subscriptionPlan: "premium",
    subscriptionStart: now.toISOString(),
    subscriptionEnd: expiry.toISOString(),
    subscription: "active",
    plan,
    subscription_start: now.toISOString(),
    subscription_end: expiry.toISOString(),
    // keep legacy fields for backwards compat
    expiryDate: expiry.toISOString(),
    isPaid: true,
    subscribedAt: now,
  };
  return updated;
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "demo@example.com": {
    password: "demo123",
    user: {
      id: "1",
      email: "demo@example.com",
      name: "Demo User",
      isPaid: false,
      isAdmin: false,
    },
  },
  "paid@example.com": {
    password: "paid123",
    user: {
      id: "2",
      email: "paid@example.com",
      name: "Paid User",
      isPaid: true,
      isAdmin: false,
      subscribedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionPlan: "premium" as const,
      subscription: "active" as const,
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  "admin@example.com": {
    password: "admin123",
    user: {
      id: "3",
      email: "admin@example.com",
      name: "Admin",
      isPaid: true,
      isAdmin: true,
      subscriptionPlan: "premium" as const,
      subscription: "active" as const,
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
};
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    totalAttempted: 0,
    totalCorrect: 0,
    chapterProgress: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  // recalc paid flag if expiry changes or passes
  useEffect(() => {
    const endString = user?.subscriptionEnd || user?.subscription_end || user?.expiryDate;
    if (user && endString) {
      const nowPaid = new Date(endString).getTime() > Date.now();
      if (user.isPaid !== nowPaid) {
        const updated: User = {
          ...user,
          isPaid: nowPaid,
          subscriptionPlan: nowPaid ? "premium" : "free",
          subscription: nowPaid ? "active" : "free",
        };
        setUser(updated);
        localStorage.setItem("neet_user", JSON.stringify(updated));
        document.cookie = `neet_user=${encodeURIComponent(JSON.stringify(updated))}; path=/; max-age=${60 * 60 * 24 * 365}`;
      }
    }
  }, [user]);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("neet_user");
    const storedProgress = localStorage.getItem("neet_progress");
    
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        setUser(migrateUser(parsed));
      } catch {
        // ignore
        setUser(null);
      }
    }
    if (storedProgress) {
      try {
        setProgress(JSON.parse(storedProgress));
      } catch {
        // ignore
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password) {
      const migrated = migrateUser(demoUser.user);
      setUser(migrated);
      localStorage.setItem("neet_user", JSON.stringify(migrated));
      document.cookie = `neet_user=${encodeURIComponent(JSON.stringify(migrated))}; path=/; max-age=${60 * 60 * 24 * 365}`;
      return true;
    }

    // Check local storage for registered users
    const registeredUsers = JSON.parse(localStorage.getItem("neet_registered_users") || "{}");
    if (registeredUsers[email] && registeredUsers[email].password === password) {
      const migrated = migrateUser(registeredUsers[email].user);
      setUser(migrated);
      localStorage.setItem("neet_user", JSON.stringify(migrated));
      document.cookie = `neet_user=${encodeURIComponent(JSON.stringify(migrated))}; path=/; max-age=${60 * 60 * 24 * 365}`;
      return true;
    }

    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (DEMO_USERS[email]) {
      return false; // Email already exists
    }

    const registeredUsers = JSON.parse(localStorage.getItem("neet_registered_users") || "{}");
    if (registeredUsers[email]) {
      return false; // Email already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      isPaid: false,
      isAdmin: false,
      subscription: "free",
    };

    registeredUsers[email] = { password, user: newUser };
    localStorage.setItem("neet_registered_users", JSON.stringify(registeredUsers));
    setUser(newUser);
    localStorage.setItem("neet_user", JSON.stringify(newUser));
    document.cookie = `neet_user=${encodeURIComponent(JSON.stringify(newUser))}; path=/; max-age=${60 * 60 * 24 * 365}`;
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("neet_user");
    document.cookie = "neet_user=; path=/; max-age=0";
  };

  const updateUser = (u: User) => {
    const migrated = migrateUser(u);
    setUser(migrated);
    localStorage.setItem("neet_user", JSON.stringify(migrated));
    document.cookie = `neet_user=${encodeURIComponent(JSON.stringify(migrated))}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  const activateSubscription = (plan: string, days: number) => {
    if (!user) return;
    const updated = applySubscription(user, plan, days);
    const migrated = migrateUser(updated);
    setUser(migrated);
    localStorage.setItem("neet_user", JSON.stringify(migrated));
    document.cookie = `neet_user=${encodeURIComponent(JSON.stringify(migrated))}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  const updateProgress = (chapterId: number, isCorrect: boolean) => {
    setProgress((prev) => {
      const newProgress = {
        totalAttempted: prev.totalAttempted + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        chapterProgress: {
          ...prev.chapterProgress,
          [chapterId]: {
            attempted: (prev.chapterProgress[chapterId]?.attempted || 0) + 1,
            correct: (prev.chapterProgress[chapterId]?.correct || 0) + (isCorrect ? 1 : 0),
          },
        },
      };
      localStorage.setItem("neet_progress", JSON.stringify(newProgress));
      return newProgress;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, progress, isLoading, login, signup, logout, updateProgress, updateUser, activateSubscription }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
