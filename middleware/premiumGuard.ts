import { NextRequest } from "next/server";
import { isPremium } from "@/lib/checkPremium";

export function getUserFromRequest(req: NextRequest) {
  const cookieValue = req.cookies.get("neet_user")?.value;
  if (!cookieValue) return null;

  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return null;
  }
}

export function premiumGuard(req: NextRequest): boolean {
  const user = getUserFromRequest(req);
  return isPremium(user);
}
