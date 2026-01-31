import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")!;

  const body = await req.json();

  const overlap = await prisma.schedule.findFirst({
    where: {
      startAt: { lt: body.endAt },
      endAt: { gt: body.startAt },
      deletedAt: null,
    },
  });

  if (overlap) {
      return errorResponse("Schedule overlap", 409);
  }

  const schedule = await prisma.schedule.create({
    data: {
      title: body.title,
      description: body.description,
      startAt: body.startAt,
      endAt: body.endAt,
      type: body.type,
      createdById: userId,
      updatedById: userId,
    },
  });

  return successResponse("Data created successfully", schedule, 200);
}

export async function GET() {
  const schedules = await prisma.schedule.findMany({
    where: { deletedAt: null },
    include: {
      participants: { include: { user: true } },
    },
  });

  return successResponse("Data loaded successfully", schedules, 200);
}
