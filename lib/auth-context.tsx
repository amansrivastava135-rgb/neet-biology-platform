"use client";
async function setJWTCookie(user: User) {
  await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      password: user.id === "3" ? "admin123" : user.id === "2" ? "paid123" : "demo123",
    }),
  });
}
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type User = {
  id: string;
  email: string;
  name: string;
  isPaid: boolean;
  subscriptionPlan?: "free" | "premium" | "expired";
  subscriptionStart?: string;
  subscriptionEnd?: string;
  subscription?: "free" | "active" | "expired";
  plan?: string;
  expiryDate?: string;
  subscription_start?: string;
  subscription_end?: string;
  devices?: string[];
  activeTestSession?: {
    sessionId: string;
    startTime: string;
    deviceId: string;
  };
  isAdmin: boolean;
  subscribedAt?: Date;
  expiresAt?: Date;
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
  updateUser: (u: User) => void;
  activateSubscription: (plan: string, days: number) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const EMPTY_PROGRESS: UserProgress = {
  totalAttempted: 0,
  totalCorrect: 0,
  chapterProgress: {},
};

function migrateUser(u: User): User {
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
  if (!migrated.subscriptionEnd && migrated.expiryDate) {
    migrated.subscriptionEnd = migrated.expiryDate;
  }
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
  migrated.isPaid = (migrated.subscriptionPlan === "premium" && migrated.subscriptionEnd ? new Date(migrated.subscriptionEnd).getTime() > Date.now() : false);
  return migrated;
}

function applySubscription(u: User, plan: string, days: number): User {
  const now = new Date();
  const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return {
    ...u,
    subscriptionPlan: "premium",
    subscriptionStart: now.toISOString(),
    subscriptionEnd: expiry.toISOString(),
    subscription: "active",
    plan,
    subscription_start: now.toISOString(),
    subscription_end: expiry.toISOString(),
    expiryDate: expiry.toISOString(),
    isPaid: true,
    subscribedAt: now,
  };
}

// Per-user progress key
function progressKey(userId: string) {
  return `neet_progress_${userId}`;
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
  const [progress, setProgress] = useState<UserProgress>(EMPTY_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

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
    const storedUser = localStorage.getItem("neet_user");
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        const migrated = migrateUser(parsed);
        setUser(migrated);
        // Load this user's own progress
        const storedProgress = localStorage.getItem(progressKey(migrated.id));
        if (storedProgress) {
          setProgress(JSON.parse(storedProgress));
        } else {
          setProgress(EMPTY_PROGRESS);
        }
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password) {
      const migrated = migrateUser(demoUser.user);
      setUser(migrated);
      // Load this user's own progress
      const storedProgress = localStorage.getItem(progressKey(migrated.id));
      const userProgress = storedProgress ? JSON.parse(storedProgress) : EMPTY_PROGRESS;
      setProgress(userProgress);
      localStorage.setItem("neet_user", JSON.stringify(migrated));
      await setJWTCookie(migrated);
      return true;
    }

    const registeredUsers = JSON.parse(localStorage.getItem("neet_registered_users") || "{}");
    if (registeredUsers[email] && registeredUsers[email].password === password) {
      const migrated = migrateUser(registeredUsers[email].user);
      setUser(migrated);
      // Load this user's own progress
      const storedProgress = localStorage.getItem(progressKey(migrated.id));
      const userProgress = storedProgress ? JSON.parse(storedProgress) : EMPTY_PROGRESS;
      setProgress(userProgress);
      localStorage.setItem("neet_user", JSON.stringify(migrated));
      await setJWTCookie(migrated);
      return true;
    }

    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (DEMO_USERS[email]) return false;

    const registeredUsers = JSON.parse(localStorage.getItem("neet_registered_users") || "{}");
    if (registeredUsers[email]) return false;

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
    // New user always starts with empty progress
    setProgress(EMPTY_PROGRESS);
    localStorage.setItem("neet_user", JSON.stringify(newUser));
    await setJWTCookie(newUser);
    return true;
  };

  const logout = async () => {
    setUser(null);
    setProgress(EMPTY_PROGRESS);
    localStorage.removeItem("neet_user");
    await fetch("/api/auth/logout", { method: "POST" });
  };

  const updateUser = async (u: User) => {
    const migrated = migrateUser(u);
    setUser(migrated);
    localStorage.setItem("neet_user", JSON.stringify(migrated));
    await setJWTCookie(migrated);
  };

  const activateSubscription = async (plan: string, days: number) => {
    if (!user) return;
    const updated = applySubscription(user, plan, days);
    const migrated = migrateUser(updated);
    setUser(migrated);
    localStorage.setItem("neet_user", JSON.stringify(migrated));
    await setJWTCookie(migrated);
  };

  const updateProgress = (chapterId: number, isCorrect: boolean) => {
    if (!user) return;
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
      // Save progress per user ID
      localStorage.setItem(progressKey(user.id), JSON.stringify(newProgress));
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