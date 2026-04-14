import { NextResponse } from "next/server";

export function requireRole(
  roles: string[],
  allowed: string[]
) {
  if (!allowed.some(r => roles.includes(r))) {
    throw new Error("FORBIDDEN");
  }
}
