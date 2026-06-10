import { generatePublicId } from "@/lib/auth/crypto";
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
    const showUser = await prisma.courseTeacher.findFirst({
      where: {
        id: parseInt(id),
        deletedAt: null,
      },
      include: {
        teacher: {
          include: {
            user: true,
          }
        },
        class: true,
        course: true,
        courseStudent: {
          where: {
            deletedAt: null,
          },
          include: {
            user: true,
          }
        },
      },
    });

    return successResponse("Data loaded successfully", showUser, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}

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
    const { ids, classId } = await req.json();

    ids.forEach(async (element: number) => {
      let publicIdExists = false;
      let publicId = '';
      while (publicIdExists == false) {
        publicId = generatePublicId();

        const existingCourseTeacher = await prisma.courseStudent.findUnique({
          where: { publicId },
        });
        if(!existingCourseTeacher) {
          publicIdExists = true;
        }
      }

      await prisma.courseStudent.create({
        data: {
          publicId,
          courseTeacherId: parseInt(id),
          userId: element,
        },
      });

    });
  
  
    return successResponse("Data created successfully", null, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
