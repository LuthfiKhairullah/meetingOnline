import { Prisma } from "@/generated/prisma/client";
import { verifyJwt } from "@/lib/jwt";
import { sendNotification } from "@/lib/notification";
import { generatePublicId } from "@/src/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function POST(req: Request) {
  const token = req.headers.get("authorization");
  const thisToken = token?.split('Bearer ')[1];
  console.log(thisToken);
  
  const { id, username, role, permission } = await verifyJwt(thisToken ?? '');
  
  const userId = id;
  // const userId = req.headers.get("x-user-id")!;
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }

  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );

  // requirePermission(permissions, ["attendance.store"]);

  try {
    console.log(userId);
    const body = await req.json();
  
    const attendance = await prisma.attendance.create({
      data: {
        userId: body.userId,
        taskId: body.taskId,
        attendanceStatusId: body.attendanceStatusId,
        note: body.note,
      },
      select: {
        id: true,
      },
    })
  
    return successResponse("Data created successfully", attendance, 200);
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

export async function GET(req: Request) {
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }

  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );

  // requirePermission(permissions, ["attendance.index"]);

  try {
    const attendances = await prisma.attendance.findMany({
      where: { deletedAt: null },
    });

    return successResponse("Data loaded successfully", attendances, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
