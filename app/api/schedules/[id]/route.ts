import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: any) {
  const body = await req.json();

  try {
    const schedule = await prisma.schedule.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        startAt: body.startAt,
        endAt: body.endAt,
        status: body.status,
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

export async function DELETE(req: Request, { params }: any) {
  const userId = req.headers.get("x-user-id")!;

  try {
    await prisma.schedule.update({
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
          return errorResponse("Schedule not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
}