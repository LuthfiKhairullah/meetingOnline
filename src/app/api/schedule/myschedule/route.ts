import { Prisma } from "@/generated/prisma/client";
import { DateHelper } from "@/lib/date";
import { verifyJwt } from "@/lib/jwt";
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

  // requirePermission(permissions, ["task.index"]);

  try {
    const tasks = await prisma.task.findMany({
      where: { deletedAt: null, categoryTaskId: 2 },
      include: {
        categoryTask: true,
        courseTeacher: {
          include: {
            teacher: {
              include: {
                user: true,
              }
            },
            class: true,
            course: true,
          }
        },
      }
    });

    const result = tasks.map((item) => {
      const courseName = item.courseTeacher.course.name;
      const className = item.courseTeacher.class.name;
      const teacherName = item.courseTeacher.teacher.user.fullname;

      return {
        ...item,
        startAt: item.startAt
          ? DateHelper.dateTimeISO(item.startAt)
          : null,
        endAt: item.endAt
          ? DateHelper.dateTimeISO(item.endAt)
          : null,
        course: courseName, // hilangkan koma
        class: className, // hilangkan koma
        teacher: teacherName, // hilangkan koma
      };
    });

    return successResponse("Data loaded successfully", result, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
