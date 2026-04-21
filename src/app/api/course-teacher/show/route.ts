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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const showTeacher = await prisma.courseTeacher.findMany({
      where: {
        deletedAt: null,
        OR: [
          {
            teacher: {
              user: {
                fullname: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            class: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            course: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      include: {
        teacher: {
            include: {
                user: true,
            }
        },
        class: true,
        course: true,
      }
    });

    const showTeachers = showTeacher.map((t) => ({
      id: t.id,
      fullname: t.teacher?.user?.fullname,
      className: t.class?.name,
      courseName: t.course?.name,
    }))

    return successResponse("Data loaded successfully", showTeachers, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
