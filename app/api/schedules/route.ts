import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
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

  requirePermission(permissions, ["schedule.store"]);

  try {
    const body = await req.json();

    const overlap = await prisma.schedule.findFirst({
      where: {
        startAt: { lt: new Date(body.endAt) },
        endAt: { gt: new Date(body.startAt) },
        deletedAt: null,
      },
    });

    if (overlap) {
        return errorResponse("Schedule overlap", 409);
    }
    let location = '';
    if(body.location != null && body.location != '') {
      location = body.location;
    }
    let type = 1;
    if(body.type != null && body.type != '') {
      type = body.type;
    }
    let status = 1;
    if(body.status != null && body.status != '') {
      status = body.status;
    }

    const schedule = await prisma.schedule.create({
      data: {
        title: body.title,
        description: body.description,
        startAt: body.startAt,
        endAt: body.endAt,
        location: location,
        scheduleTypeId: type,
        scheduleStatusId: status,
        host: body.host,
        meetingUrl: body.meetingUrl,
        createdById: userId,
        updatedById: userId,
      },
    });

    return successResponse("Data created successfully", schedule, 200);
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

  requirePermission(permissions, ["schedule.index"]);

  try {
    const schedules = await prisma.schedule.findMany({
      where: { deletedAt: null },
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
