// middleware.ts
import { NextResponse } from "next/server";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  const publicRoutes = ["/", "/all-products", "/register", "/login", "/forgot-password ","/seller"];
  const protectedRoutes = ["/cart", "/checkout", "/profile"];

  // Allow public routes and product pages
  if (publicRoutes.includes(path) || path.startsWith("/product/")) {
    return NextResponse.next();
  }

  // Check protected routes
  if (protectedRoutes.some((route) => path.startsWith(route))) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("intendedRoute", path);
      return NextResponse.redirect(url);
    }

    // Verify token
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (!response.ok || !data.verified) {
        const url = new URL("/login", request.url);
        url.searchParams.set("intendedRoute", path);
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth error:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};