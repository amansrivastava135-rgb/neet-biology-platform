"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type User = {
  id: string;
  email: string;
  name: string;
  isPaid: boolean;
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("neet_user");
    const storedProgress = localStorage.getItem("neet_progress");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      localStorage.setItem("neet_user", JSON.stringify(demoUser.user));
      return true;
    }

    // Check local storage for registered users
    const registeredUsers = JSON.parse(localStorage.getItem("neet_registered_users") || "{}");
    if (registeredUsers[email] && registeredUsers[email].password === password) {
      setUser(registeredUsers[email].user);
      localStorage.setItem("neet_user", JSON.stringify(registeredUsers[email].user));
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
      value={{ user, progress, isLoading, login, signup, logout, updateProgress }}
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
