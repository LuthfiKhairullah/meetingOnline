import { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

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
  
  requirePermission(permissions, ["task.update"]);

  try {
    const { id } = await context.params;
    const body = await req.json();
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        description: body.description,
        startAt: body.startAt,
        endAt: body.endAt,
        scheduleStatusId: body.status,
        scheduleTypeId: body.type,
      },
    });

    return successResponse("Data updated successfully", task, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("Task not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }
    
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: Request, { params }: any) {
  const userId = req.headers.get("x-user-id")!;
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }

  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["task.delete"]);
  
  try {
    await prisma.task.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });

    return successResponse("Data deleted successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("Task not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
}