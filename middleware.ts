import { NextResponse, type NextRequest } from "next/server";
import { premiumGuard } from "@/middleware/premiumGuard";

const premiumRoutes = ["/dashboard", "/analytics"];
const adminRoutes = ["/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin route protection
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const userCookie = req.cookies.get("neet_user");

    if (!userCookie) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      if (!user.isAdmin) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/dashboard";
        return NextResponse.redirect(redirectUrl);
      }
      // Admin valid — seedha jaane do
      return NextResponse.next();
    } catch {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Premium route protection
  if (premiumRoutes.some((route) => pathname.startsWith(route))) {
    if (!premiumGuard(req)) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/pricing";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/analytics/:path*", "/admin/:path*"],
};