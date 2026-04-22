import { getUserAccess } from "@/lib/auth";
import { verifyJwt } from "@/lib/jwt";
import { NextResponse, NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/register",
  "/api/auth/refresh",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico")
  ) {
    console.log('token');
    return NextResponse.next();
  }

  // ✅ allow public
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  let clientType =
    req.headers.get('x-client-type') ||
    req.cookies.get('x-client-type')?.value ||
    undefined

  let token: string | undefined

  if (clientType == "web") {
    token = req.cookies.get("token")?.value;
  } else {
    const authHeader = req.headers.get("authorization")
    token = authHeader?.split(" ")[1]
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { id, username, role, permission } = await verifyJwt(token ?? '');

  // const access = await getUserAccess(id);

  const headers = new Headers(req.headers);
  headers.set("x-user-id", id);
  headers.set("x-user-roles", JSON.stringify(role));
  headers.set("x-user-permissions", JSON.stringify(permission));
  // headers.set("x-user-type", JSON.stringify(access.userTypes));
  console.log(headers);

  return NextResponse.next();
}