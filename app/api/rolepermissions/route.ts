import { requirePermission } from "@/lib/auth/requirePermission";
import { requireRole } from "@/lib/auth/requireRole";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

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

  requirePermission(permissions, ["rolepermissions.store"]);

  try {
  
    const body = await req.json();
  
    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId: body.roleId,
        permissionId: body.permissionId,
      },
    });
  
    return successResponse("Data created successfully", rolePermission, 200);
  } catch (error: any) {    
    return errorResponse(error.message, 409);
  }
}

export async function GET(req: Request) {
  try {
    const types: string[] = JSON.parse(
      req.headers.get("x-user-type") || "[]"
    );
    if(!types.includes(process.env.USER_TYPE ?? '')) {
      return errorResponse("User not verified", 409);
    }

    const permissions: string[] = JSON.parse(
      req.headers.get("x-user-permissions") || "[]"
    );

    requirePermission(permissions, ["rolepermissions.index"]);

    const rolePermissions = await prisma.rolePermission.findMany();

    return successResponse("Data loaded successfully", rolePermissions, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
