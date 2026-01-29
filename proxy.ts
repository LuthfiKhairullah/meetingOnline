import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import { getUserAccess } from "@/lib/auth";
import { errorResponse, successResponse } from "./lib/response";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ PUBLIC ROUTES
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register")
  ) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return errorResponse("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return errorResponse("Invalid token", 401);
  }

  try {
    const { userId } = verifyJwt(token);

    const access = await getUserAccess(userId);

    const headers = new Headers(req.headers);
    headers.set("x-user-id", userId);
    headers.set("x-user-roles", JSON.stringify(access.roles));
    headers.set("x-user-permissions", JSON.stringify(access.permissions));

    return successResponse("Login successful", { request: { headers } }, 200);
  } catch {
    return errorResponse("Invalid token", 401);
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
