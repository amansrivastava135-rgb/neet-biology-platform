import { NextResponse, type NextRequest } from "next/server";
import { premiumGuard } from "@/middleware/premiumGuard";

// Only protect premium-only pages (free users can access demo and preview content)
const protectedRoutes = ["/dashboard", "/analytics"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!premiumGuard(req)) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/pricing";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/analytics/:path*"],
};
