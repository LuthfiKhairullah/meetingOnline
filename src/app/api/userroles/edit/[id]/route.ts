import { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }
  
  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );
  
  requirePermission(permissions, ["userroles.update"]);
  
  try {
    const { id } = await context.params;
  
    const body = await req.json();
    const userRole = await prisma.userRole.update({
      where: { id: parseInt(id) },
      data: {
        userId: body.userId,
        roleId: body.roleId,
      },
    });

    return successResponse("Data updated successfully", userRole, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("Role not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }
    
    return errorResponse("Internal server error", 500);
  }
}