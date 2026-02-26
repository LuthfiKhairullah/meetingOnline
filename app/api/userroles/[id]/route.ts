import { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: any) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );

  if(types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }

  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );
  
  requirePermission(permissions, ["userroles.update"]);

  const body = await req.json();
  try {
    const userRole = await prisma.userRole.update({
      where: { id: params.id },
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

export async function DELETE(req: Request, { params }: any) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  
  if(types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }
  
  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["userroles.delete"]);

  try {
    await prisma.userRole.delete({
      where: { id: params.id },
    });

    return successResponse("Data deleted successfully", 200);
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