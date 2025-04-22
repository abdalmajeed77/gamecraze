import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request) {
  const publicRoutes = [
    "/",
    "/all-products",
    "/register",
    "/login",
    "/forgot-password",
    "/seller",
  ];

  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path) || path.startsWith("/product/") || path.startsWith("/seller");

  if (isPublicRoute) {
    console.log(`Middleware: Allowing access to public route: ${path}`);
    return NextResponse.next();
  }

  // Fallback to localhost if NEXT_PUBLIC_API_BASE_URL is not set
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.warn("Middleware: NEXT_PUBLIC_API_BASE_URL is not set, falling back to http://localhost:3000");
  }

  // Call the API route to verify the token
  try {
    const verifyResponse = await fetch(`${baseUrl}/api/auth/verify-token`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      console.log(`Middleware: Token verification failed for route: ${path}, redirecting to /login`, verifyData);
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("intendedRoute", path);
      return NextResponse.redirect(url);
    }

    console.log(`Middleware: Token valid for route: ${path}`);
    return NextResponse.next();
  } catch (error) {
    console.error(`Middleware: Error verifying token for route: ${path}`, {
      message: error.message,
      name: error.name,
    });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("intendedRoute", path);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/my-orders", "/cart", "/checkout", "/profile", "/seller/dashboard"],
};