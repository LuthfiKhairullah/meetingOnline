import { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }

  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["schedule.index"]);

  try {
    const { id } = await context.params;

    const schedules = await prisma.schedule.findFirst({
      where: {
        publicId: id,
        deletedAt: null,
      },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        scheduleStatus: true,
        scheduleType: true,
      },
      orderBy: [
        {
          startAt: 'desc',
        },
        {
          endAt: 'desc',
        }
      ],
    });

    return successResponse("Data loaded successfully", schedules, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const userId = req.headers.get("x-user-id")!;
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }
  
  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  )
  
  requirePermission(permissions, ["schedule.update"]);

  try {
    const { id } = await context.params;

    const body = await req.json();

    const schedule = await prisma.schedule.update({
      where: { publicId: id },
      data: {
        title: body.title,
        description: body.description,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        location: body.location,
        scheduleTypeId: body.type,
        scheduleStatusId: body.status,
        updatedById: userId,
      },
    });

    return successResponse("Data updated successfully", schedule, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("Schedule not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }
    
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
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

  requirePermission(permissions, ["schedule.delete"]);
  
  try {
    const { id } = await context.params;
    await prisma.schedule.update({
      where: { id: id },
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
          return errorResponse("Schedule not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
}