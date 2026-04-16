import { NextResponse, NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // ✅ allow public
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = req.headers.get("authorization");
  const tokenCookies = req.cookies.get("token")?.value;

  if (!token && !tokenCookies) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}