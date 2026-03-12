"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type User = {
  id: string;
  email: string;
  name: string;
  // legacy boolean used throughout the UI for quick checks
  isPaid: boolean;
  // subscription details
  subscription?: "free" | "active" | "expired";
  plan?: string;
  expiryDate?: string; // ISO string (legacy)
  subscription_start?: string; // ISO string for 365-day subscription
  subscription_end?: string; // ISO string
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
  if (migrated.subscription === undefined) {
    migrated.subscription = migrated.isPaid ? "active" : "free";
  }
  if (migrated.expiryDate === undefined && migrated.expiresAt) {
    migrated.expiryDate = (migrated.expiresAt as Date).toISOString();
  }
  
  // check if subscription_end has passed (for 365-day subscriptions)
  if (migrated.subscription === "active" && migrated.subscription_end) {
    const now = new Date();
    const endDate = new Date(migrated.subscription_end);
    if (now.getTime() > endDate.getTime()) {
      migrated.subscription = "expired";
      migrated.isPaid = false;
    } else {
      migrated.isPaid = true;
    }
    return migrated;
  }
  
  // calculate isPaid based on legacy expiryDate
  if (migrated.subscription === "active" && migrated.expiryDate) {
    migrated.isPaid = new Date(migrated.expiryDate).getTime() > Date.now();
  } else {
    migrated.isPaid = false;
  }
  return migrated;
}

function applySubscription(u: User, plan: string, days: number): User {
  const now = new Date();
  const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const updated: User = {
    ...u,
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
    if (user && user.expiryDate) {
      const nowPaid = new Date(user.expiryDate).getTime() > Date.now();
      if (user.isPaid !== nowPaid) {
        const updated: User = {
          ...user,
          isPaid: nowPaid,
          subscription: nowPaid ? "active" : "free",
        };
        setUser(updated);
        localStorage.setItem("neet_user", JSON.stringify(updated));
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
      return true;
    }

    // Check local storage for registered users
    const registeredUsers = JSON.parse(localStorage.getItem("neet_registered_users") || "{}");
    if (registeredUsers[email] && registeredUsers[email].password === password) {
      const migrated = migrateUser(registeredUsers[email].user);
      setUser(migrated);
      localStorage.setItem("neet_user", JSON.stringify(migrated));
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
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("neet_user");
  };

  const updateUser = (u: User) => {
    const migrated = migrateUser(u);
    setUser(migrated);
    localStorage.setItem("neet_user", JSON.stringify(migrated));
  };

  const activateSubscription = (plan: string, days: number) => {
    if (!user) return;
    const updated = applySubscription(user, plan, days);
    const migrated = migrateUser(updated);
    setUser(migrated);
    localStorage.setItem("neet_user", JSON.stringify(migrated));
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
