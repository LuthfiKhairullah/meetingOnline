import { requirePermission } from "@/src/lib/auth/requirePermission";
import { requireRole } from "@/src/lib/auth/requireRole";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function POST(req: Request) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }

  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["permissions.store"]);

  try {

    const body = await req.json();
  
    const permission = await prisma.permission.create({
      data: {
        code: body.code,
        name: body.name,
      },
    });
  
    return successResponse("Data created successfully", permission, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}

export async function GET(req: Request) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }

  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["permissions.index"]);

  try {
    const showpermissions = await prisma.permission.findMany();

    return successResponse("Data loaded successfully", showpermissions, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
