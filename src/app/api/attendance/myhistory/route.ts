import { Prisma } from "@/generated/prisma/client";
import { DateHelper } from "@/lib/date";
import { verifyJwt } from "@/lib/jwt";
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

  // requirePermission(permissions, ["users.index"]);

  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        userId: userId,
        deletedAt: null,
      },
    });

    if(!attendances) {
      return errorResponse('Data not found', 409);
    }

    const result = attendances.map(item => ({
      ...item,
      createdAt: item.createdAt
        ? DateHelper.dateTimeISO(item.createdAt)
        : null,
      deletedAt: item.deletedAt
        ? DateHelper.dateTimeISO(item.deletedAt)
        : null,
    }));

    return successResponse("Data loaded successfully", result, 200);
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
  
  // requirePermission(permissions, ["task.update"]);

  try {
    const { id } = await context.params;
    const body = await req.json();
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        description: body.description,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
      },
    });

    return successResponse("Data updated successfully", task, 200);
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

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const token = req.headers.get("authorization");
  const thisToken = token?.split('Bearer ')[1];
  console.log(thisToken);
  
  const { id: userId, username, role, permission } = await verifyJwt(thisToken ?? '');
  
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

  // requirePermission(permissions, ["task.delete"]);
  
  try {
    const { id } = await context.params;
    await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(),
        deletedById: parseInt(userId),
      },
    });

    return successResponse("Data deleted successfully", 200);
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