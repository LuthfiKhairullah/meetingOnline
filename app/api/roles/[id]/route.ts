import { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: any) {
  try {
    const body = await req.json();
    const types: string[] = JSON.parse(
      req.headers.get("x-user-type") || "[]"
    );
    if(types.includes(process.env.USER_TYPE ?? '')) {
      return errorResponse("User not verified", 409);
    }
  
    const permissions: string[] = JSON.parse(
      req.headers.get("x-user-permissions") || "[]"
    );
  
    requirePermission(permissions, ["roles.update"]);
    const role = await prisma.role.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return successResponse("Data updated successfully", role, 200);
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  
  try {
    const types: string[] = JSON.parse(
      req.headers.get("x-user-type") || "[]"
    );
    if(types.includes(process.env.USER_TYPE ?? '')) {
      return errorResponse("User not verified", 409);
    }
  
    const permissions: string[] = JSON.parse(
      req.headers.get("x-user-permissions") || "[]"
    );
  
    requirePermission(permissions, ["roles.delete"]);

    const { id } = await params;

    await prisma.role.delete({
      where: { id },
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