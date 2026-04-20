import { generatePublicId } from "@/lib/auth/crypto";
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
      let publicIdExists = false;
      let publicId = '';
      while (publicIdExists == false) {
        publicId = generatePublicId();

        const existingUser = await prisma.courseStudent.findUnique({
          where: { publicId },
        });
        if(!existingUser) {
          publicIdExists = true;
        }
      }
      await prisma.courseStudent.create({
        data: {
          publicId,
          userId: parseInt(id),
          courseTeacherId: element,
        },
      });
    });
  
    return successResponse("Data created successfully", null, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
