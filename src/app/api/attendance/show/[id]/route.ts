import { Prisma } from "@/generated/prisma/client";
import { verifyJwt } from "@/lib/jwt";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }

  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );

  // requirePermission(permissions, ["users.index"]);

  try {
    const { id } = await context.params;
    const attendances = await prisma.attendance.findFirst({
      where: {
        id: parseInt(id),
      },
    });

    if(!attendances) {
      return errorResponse('Data not found', 409);
    }
    
    return successResponse("Data loaded successfully", attendances, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}