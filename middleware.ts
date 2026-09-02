import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isDashboardRoute =
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/appointments") ||
      req.nextUrl.pathname.startsWith("/services") ||
      req.nextUrl.pathname.startsWith("/availability") ||
      req.nextUrl.pathname.startsWith("/clients") ||
      req.nextUrl.pathname.startsWith("/settings");

    if (isDashboardRoute && !isAuth) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only require auth for dashboard paths
        const path = req.nextUrl.pathname;
        const requiresAuth =
          path.startsWith("/dashboard") ||
          path.startsWith("/appointments") ||
          path.startsWith("/services") ||
          path.startsWith("/availability") ||
          path.startsWith("/clients") ||
          path.startsWith("/settings");

        if (requiresAuth) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/appointments/:path*",
    "/services/:path*",
    "/availability/:path*",
    "/clients/:path*",
    "/settings/:path*",
  ],
};
