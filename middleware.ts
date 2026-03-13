import { NextResponse, type NextRequest } from "next/server";
import { premiumGuard } from "@/middleware/premiumGuard";

const protectedRoutes = ["/mock-test", "/practice", "/dashboard", "/analytics"];

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
  matcher: ["/mock-test/:path*", "/practice/:path*", "/dashboard/:path*", "/analytics/:path*"],
};
