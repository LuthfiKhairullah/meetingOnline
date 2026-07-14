import { generatePublicId } from "@/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import { requireRole } from "@/src/lib/auth/requireRole";
import { verifyJwt } from "@/lib/jwt";
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

  // requirePermission(permissions, ["permissions.index"]);

  try {
    const courseStudents = await prisma.courseStudent.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        courseTeacherId: true,
      },
    });

    const courseTeacherIds = courseStudents.map(
      (item) => item.courseTeacherId,
    );

    console.log('courseTeacherIds')
    console.log(courseTeacherIds)

    const classes = await prisma.class.findMany({
      where: {
        // deletedAt: null,
        courseTeacher: {
          some: {
            teacherId: {
              in: courseTeacherIds
            }
          },
        },
      },
      // include: {
      //   courseTeacher: {
      //     include: {
      //       teacher: {
      //         include: {
      //           user: true,
      //         },
      //       },
      //       class: true,
      //       course: true,
      //     },
      //   },
      // },
    });

    return successResponse("Data loaded successfully", classes, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
