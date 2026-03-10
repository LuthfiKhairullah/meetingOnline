import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")!;
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }

  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["task.store"]);

  const body = await req.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
      scheduleStatusId: body.status,
      scheduleTypeId: body.type,
      createdById: userId,
      updatedById: userId,
    },
  });

  return successResponse("Data created successfully", task, 200);
}

export async function GET(req: Request) {
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

    requirePermission(permissions, ["task.index"]);

    const tasks = await prisma.task.findMany({
      where: { deletedAt: null },
      include: {
        participants: { include: { user: true } },
      },
    });

    return successResponse("Data loaded successfully", tasks, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
