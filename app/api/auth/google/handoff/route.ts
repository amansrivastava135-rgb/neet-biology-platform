import { NextRequest, NextResponse } from "next/server";

// GET /api/auth/google/handoff
// Sets neet_user in localStorage via inline script, then redirects
// This is needed because httpOnly cookie is set server-side,
// but localStorage can only be written client-side
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userParam = searchParams.get("user");
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  if (!userParam) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login?error=google_failed`
    );
  }

  // Sanitize redirectTo — only allow internal paths
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  // Inline HTML — sets localStorage and immediately navigates
  // No flash: background matches app background color
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Signing you in...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      height: 100%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid #e5e7eb;
      border-top-color: #16a34a;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <script>
    try {
      const user = ${JSON.stringify(userParam)};
      localStorage.setItem('neet_user', user);
    } catch(e) {}
    window.location.replace(${JSON.stringify(safeRedirect)});
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // No cache — this is a transient handoff page
      "Cache-Control": "no-store",
    },
  });
}
