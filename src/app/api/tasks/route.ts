import { Prisma } from "@/generated/prisma/client";
import { verifyJwt } from "@/lib/jwt";
import { generatePublicId } from "@/src/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function POST(req: Request) {
  const token = req.headers.get("authorization");
  const thisToken = token?.split('Bearer ')[1];
  console.log(thisToken);
  
  const { id, username, role, permission } = await verifyJwt(thisToken ?? '');
  
  const userId = id;
  // const userId = req.headers.get("x-user-id")!;
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }

  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );

  // requirePermission(permissions, ["task.store"]);

  try {
    console.log(userId);
    const body = await req.json();

    let publicId = '';
    let exists = true;

    while (exists) {
      publicId = generatePublicId();

      const userDevice = await prisma.userDevice.findFirst({
        where: {
          publicId,
          deletedAt: null,
        },
        select: { id: true }, // lebih ringan
      });

      exists = !!userDevice;
    }
  
    const task = await prisma.task.create({
      data: {
        publicId,
        title: body.title,
        description: body.description,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        courseTeacherId: body.courseTeacherId,
        categoryTaskId: body.categoryTaskId,
        meetingUrl: body.meetingUrl,
        location: body.location,
        revTaskId: body.revTaskId,
        createdById: parseInt(userId),
        updatedById: parseInt(userId),
      },
    });
  
    return successResponse("Data created successfully", task, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("Task not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
}

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

  // requirePermission(permissions, ["task.index"]);

  try {
    const tasks = await prisma.task.findMany({
      where: { deletedAt: null },
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
      const startAt = new Date(item.startAt);
      const endAt = new Date(item.endAt);

      const formattedStartAt = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(startAt);
      const formattedEndAt = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(endAt);

      const courseName = item.courseTeacher.course.name;
      const className = item.courseTeacher.class.name;
      const teacherName = item.courseTeacher.teacher.user.fullname;

      return {
        ...item,
        startAt: formattedStartAt.replace(",", ""), // hilangkan koma
        endAt: formattedEndAt.replace(",", ""), // hilangkan koma
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
