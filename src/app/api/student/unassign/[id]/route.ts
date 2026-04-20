import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
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

    await prisma.courseStudent.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: parseInt(id),
      },
    });
  
    return successResponse("Data created successfully", null, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}