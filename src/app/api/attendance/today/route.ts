import { Prisma } from "@/generated/prisma/client";
import { DateHelper } from "@/lib/date";
import { verifyJwt } from "@/lib/jwt";
import { sendNotification } from "@/lib/notification";
import { generatePublicId } from "@/src/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function GET(req: Request) {
  const token = req.headers.get("authorization");
  const thisToken = token?.split('Bearer ')[1];
  console.log(thisToken);
  
  const { id, username, role, permission } = await verifyJwt(thisToken ?? '');
  
  const userId = id;
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

    let result = null;

    if(attendances) {
      result = {
        ...attendances,
        createdAt: attendances?.createdAt != null ? DateHelper.dateTime(attendances?.createdAt) : '',
        deletedAt: attendances?.deletedAt != null ? DateHelper.dateTime(attendances?.deletedAt) : '',
      }
    }

    console.log('result');
    console.log(result);
    

    return successResponse("Data loaded successfully", result, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
