import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
export const COOKIE_NAME = "neet_token";

export interface JWTUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isPaid: boolean;
  isPremium: boolean;
  subscriptionPlan?: string;
  subscriptionEnd?: string;
}

export async function signToken(user: JWTUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d") // consistent everywhere
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<JWTUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getTokenCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365, // 365 days
    path: "/",
  };
}