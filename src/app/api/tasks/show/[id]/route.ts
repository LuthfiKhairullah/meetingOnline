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
    const showCourse = await prisma.task.findFirst({
      where: {
        id: parseInt(id),
      },
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

    if(!showCourse) {
      return errorResponse('Data not found', 409);
    }

    const showTaskScore = await prisma.taskScore.findMany({
      where: {
        taskId: parseInt(id),
        deletedAt: null,
      },
    });

    const courseName = showCourse.courseTeacher.course.name;
    const className = showCourse.courseTeacher.class.name;
    const teacherName = showCourse.courseTeacher.teacher.user.fullname;

    const startAt = new Date(showCourse.startAt);
    const endAt = new Date(showCourse.endAt);

    const toDatetimeLocal = (date: Date) => {
      const formatted = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);

      return formatted.replace(" ", "T");
    };

    const result = {
      ...showCourse,
      startAt: toDatetimeLocal(startAt),
      endAt: toDatetimeLocal(endAt),
      course: courseName, // hilangkan koma
      class: className, // hilangkan koma
      teacher: teacherName,
    };

    return successResponse("Data loaded successfully", result, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}