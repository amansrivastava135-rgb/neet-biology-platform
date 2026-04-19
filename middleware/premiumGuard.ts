import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/auth";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function premiumGuard(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.isPaid === true) {
      const subEnd = payload.subscriptionEnd as string | undefined;
      if (!subEnd) return true;
      return new Date(subEnd).getTime() > Date.now();
    }
    return false;
  } catch {
    return false;
  }
}