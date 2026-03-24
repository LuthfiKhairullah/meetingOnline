import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
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
    
    requirePermission(permissions, ["userroles.store"]);
  
    const body = await req.json();
  
    const userRole = await prisma.userRole.create({
      data: {
        userId: body.userId,
        roleId: body.roleId,
      },
    });
  
    return successResponse("Data created successfully", userRole, 200);
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

    requirePermission(permissions, ["userroles.index"]);

    const userRoles = await prisma.userRole.findMany();

    return successResponse("Data loaded successfully", userRoles, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
