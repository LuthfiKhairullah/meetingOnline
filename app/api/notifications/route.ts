import { requirePermission } from "@/lib/auth/requirePermission";
import { requireRole } from "@/lib/auth/requireRole";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")!;
  
    const types: string[] = JSON.parse(
      req.headers.get("x-user-type") || "[]"
    );
    if(!types.includes(process.env.USER_TYPE ?? '')) {
      return errorResponse("User not verified", 409);
    }
  
    const permissions: string[] = JSON.parse(
      req.headers.get("x-user-permissions") || "[]"
    );
  
    requirePermission(permissions, ["notifications.store"]);
  
    const body = await req.json();
  
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        title: body.title,
        notificationTypeId: body.type,
        message: body.message,
        sendAt: body.sendAt,
      },
    });
  
    return successResponse("Data created successfully", notification, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}

export async function GET(req: Request) {
  try {
    const types: string[] = JSON.parse(
      req.headers.get("x-user-type") || "[]"
    );
    if(!types.includes(process.env.USER_TYPE ?? '')) {
      return errorResponse("User not verified", 409);
    }

    const permissions: string[] = JSON.parse(
      req.headers.get("x-user-permissions") || "[]"
    );

    requirePermission(permissions, ["notifications.index"]);

    const notifications = await prisma.notification.findMany({
      include: {
        schedule: true,
        user: true,
      },
    });

    return successResponse("Data loaded successfully", notifications, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
