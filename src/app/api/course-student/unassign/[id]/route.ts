import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }

  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );
  
  // requirePermission(permissions, ["userroles.store"]);

  try {
    const { id } = await context.params;
    const { ids } = await req.json();

    ids.forEach(async (element: number) => {
      await prisma.courseStudent.updateMany({
        where: {
          userId: element,
          courseTeacherId: parseInt(id),
        },
        data: {
          deletedAt: new Date(),
        }
      });
    });
  
  
    return successResponse("Data created successfully", null, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}