import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/src/lib/jwt";
import { getUserAccess } from "@/src/lib/auth";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ PUBLIC ROUTES
  if (
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/verify-email") ||
    pathname.startsWith("/api/auth/refresh") ||
    pathname.startsWith("/api/notificationType")
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
    const { id, username } = await verifyJwt(token);
    console.log(id);
    console.log(username);

    const access = await getUserAccess(id);

    const headers = new Headers(req.headers);
    headers.set("x-user-id", id);
    headers.set("x-user-roles", JSON.stringify(access.roles));
    headers.set("x-user-permissions", JSON.stringify(access.permissions));
    headers.set("x-user-type", JSON.stringify(access.userTypes));
    console.log(headers);
    
    return NextResponse.next({
      request: {
        headers,
      },
    });
  } catch {
    return errorResponse("Invalid token", 401);
  }
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
