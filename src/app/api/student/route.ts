import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

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

  // requirePermission(permissions, ["permissions.index"]);

  try {
    const showStudent = await prisma.user.findMany({
      where: {
        userRole: {
          some: {
            role: {
              name: 'Student',
            },
          },
        },
      }
    });

    return successResponse("Data loaded successfully", showStudent, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
