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
      // 🔒 Validate session with backend
      const response = await fetch(`${process.env.BACKEND_URL}/session`, {
        headers: {
          Cookie: `connect.sid=${sessionCookie.value}`,
        },
      });

      if (response.ok) {
        const session = await response.json();
        user = {
          id: session?.user?.id,
          username: session?.user?.username,
          email: session?.user?.email,
          role: session?.user?.role || "guest",
        };
        isAuthenticated = true;
        
        // ❌ REMOVED: Cannot use React hooks in middleware
        // const { setIsAuthenticated } = useAuthStore();
        // setIsAuthenticated(isAuthenticated);
        
      } else {
        console.warn("⚠️ Session check failed with status:", response.status);
      }
    } catch (error) {
      console.error("❌ Session validation error:", error);
    }
  }

  const isPublicRoute = ["/", "/login", "/signup"].includes(pathname);
  const isProtectedRoute = !isPublicRoute;

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthenticated && isPublicRoute) {
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