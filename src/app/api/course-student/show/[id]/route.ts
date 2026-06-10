import { Prisma } from "@/generated/prisma/client";
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
          include: {
            user: true
          }
        },
      },
    });

    return successResponse("Data loaded successfully", showUser, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }

  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );

  // requirePermission(permissions, ["permissions.update"]);

  try {
    const { id } = await context.params;
    const body = await req.json();
    const showCourse = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        userId: body.name,
      },
    });

    return successResponse("Data updated successfully", showCourse, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("Permission not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }
    
    return errorResponse("Internal server error", 500);
  }
}

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

  // requirePermission(permissions, ["permissions.delete"]);

  try {
    const { id } = await context.params;
    await prisma.teacher.delete({
      where: { id: parseInt(id) },
    });

  return successResponse("Data deleted successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("Permission not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
}