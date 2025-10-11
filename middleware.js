import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ✅ Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get("connect.sid");
  let isAuthenticated = false;
  let user = null;

  if (sessionCookie) {
    try {
      // 🔒 Validate session with backend (use internal URL for server-side calls)
      const backendUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/session`, {
        method: 'GET',
        headers: {
          Cookie: `connect.sid=${sessionCookie.value}`,
        },
        // Disable SSL verification for staging with self-signed certs
        ...(process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' && {
          agent: undefined // Let Node.js handle based on NODE_TLS_REJECT_UNAUTHORIZED env var
        })
      });

      if (response.ok) {
        const session = await response.json();
        if (session.success && session.user) {
          user = {
            id: session.user.id,
            username: session.user.username,
            email: session.user.email,
            role: session.user.role || "guest",
          };
          isAuthenticated = true;
          console.log("✅ Middleware: User authenticated:", user.username);
        }
      } else {
        console.warn("⚠️ Session check failed with status:", response.status);
      }
    } catch (error) {
      console.error("❌ Session validation error:", error.message);
    }
  } else {
    console.log("ℹ️ No session cookie found");
  }

  const isPublicRoute = ["/", "/login", "/signup"].includes(pathname);
  const isProtectedRoute = !isPublicRoute;

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from public routes (login/signup) to home
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  const requestHeaders = new Headers(req.headers);

  if (user) {
    // 👇 Pass user data to client via headers instead of using hooks
    requestHeaders.set("x-user", JSON.stringify(user));
    requestHeaders.set("x-authenticated", "true");

  } else {
    requestHeaders.set("x-authenticated", "false");
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};