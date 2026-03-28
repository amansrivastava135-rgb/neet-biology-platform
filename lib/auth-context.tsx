"use client";

async function setJWTCookie(user: User) {
  await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user }),
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
  isAdmin: boolean;
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
      subscription: "free",
      subscriptionPlan: "free",
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
      subscriptionPlan: "premium",
      subscription: "active",
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
      subscriptionPlan: "premium",
      subscription: "active",
      subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
};

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
    isPaid: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress>(EMPTY_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("neet_user");
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        setUser(parsed);
        const storedProgress = localStorage.getItem(progressKey(parsed.id));
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
    // Demo users check
    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      const storedProgress = localStorage.getItem(progressKey(demoUser.user.id));
      setProgress(storedProgress ? JSON.parse(storedProgress) : EMPTY_PROGRESS);
      localStorage.setItem("neet_user", JSON.stringify(demoUser.user));
      await setJWTCookie(demoUser.user);
      return true;
    }

    // Supabase se login
    const res = await fetch("/api/auth/login-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.success && data.user) {
      setUser(data.user);
      const storedProgress = localStorage.getItem(progressKey(data.user.id));
      setProgress(storedProgress ? JSON.parse(storedProgress) : EMPTY_PROGRESS);
      localStorage.setItem("neet_user", JSON.stringify(data.user));
      return true;
    }

    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Demo users check
    if (DEMO_USERS[email]) return false;

    // Supabase mein signup
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.success && data.user) {
      const newUser: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        isPaid: false,
        isAdmin: false,
        subscription: "free",
        subscriptionPlan: "free",
      };
      setUser(newUser);
      setProgress(EMPTY_PROGRESS);
      localStorage.setItem("neet_user", JSON.stringify(newUser));
      await setJWTCookie(newUser);
      return true;
    }

    return false;
  };

  const logout = async () => {
    setUser(null);
    setProgress(EMPTY_PROGRESS);
    localStorage.removeItem("neet_user");
    await fetch("/api/auth/logout", { method: "POST" });
  };

  const updateUser = async (u: User) => {
    setUser(u);
    localStorage.setItem("neet_user", JSON.stringify(u));
    await setJWTCookie(u);
  };

  const activateSubscription = async (plan: string, days: number) => {
    if (!user) return;
    const updated = applySubscription(user, plan, days);
    setUser(updated);
    localStorage.setItem("neet_user", JSON.stringify(updated));
    await setJWTCookie(updated);
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