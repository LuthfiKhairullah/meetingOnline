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
    const operationalDate = new Date();

    if (operationalDate.getUTCHours() < 17) {
      operationalDate.setDate(operationalDate.getDate() - 1);
    }

    const startOfDay = new Date(operationalDate);
    startOfDay.setUTCHours(17, 0, 0, 0);

    const endOfDay = new Date(operationalDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setUTCHours(16, 59, 59, 999);

    const attendances = await prisma.attendance.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        deletedAt: null,
      },
    });

    if(!attendances) {
      const attendance = await prisma.attendance.create({
        data: {
          userId: userId,
          attendanceStatusId: 1,
        },
        select: {
          id: true,
        },
      });

      return successResponse("Data created successfully", attendance, 200);
    }

      // return successResponse("Data created successfully", [], 200);
    return errorResponse("Already Attended", 404);
  
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(error.message);
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

