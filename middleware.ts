import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { premiumGuard } from "@/middleware/premiumGuard";

const premiumRoutes = ["/dashboard", "/analytics"];
const adminRoutes = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin route protection
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const token = req.cookies.get("neet_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      if (!payload.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Premium route protection
  if (premiumRoutes.some((route) => pathname.startsWith(route))) {
    if (!premiumGuard(req)) {
      return NextResponse.redirect(new URL("/pricing", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/analytics/:path*", "/admin/:path*"],
};