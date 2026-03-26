import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { premiumGuard } from "@/middleware/premiumGuard";
import { COOKIE_NAME } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin route protection
  if (ROUTES.admin.some((r) => pathname.startsWith(r))) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (!payload.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete(COOKIE_NAME);
      return res;
    }
  }

  // Premium route protection
  if (ROUTES.premium.some((r) => pathname.startsWith(r))) {
    const isPremium = await premiumGuard(req);
    if (!isPremium) {
      return NextResponse.redirect(new URL("/pricing", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/analytics/:path*", "/admin/:path*"],
};