import { NextResponse } from "next/server";

export function requirePermission(
  permissions: string[],
  allowed: string[]
) {
  if (!allowed.some(r => permissions.includes(r))) {
    throw new Error("FORBIDDEN");
  }
}
