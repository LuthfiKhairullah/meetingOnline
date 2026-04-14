import { generatePublicId } from "@/src/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import { requireRole } from "@/src/lib/auth/requireRole";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

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
  
    let publicId = '';
    let exists = true;

    while (exists) {
      publicId = generatePublicId();

      const notification = await prisma.notification.findFirst({
        where: { publicId },
        select: { id: true }, // lebih ringan
      });

      exists = !!notification;
    }

    const notification = await prisma.notification.create({
      data: {
        publicId,
        userId: parseInt(userId),
        title: body.title,
        description: body.message,
        sendAt: body.sendAt,
        categoryNotificationId: 3,
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
        user: true,
      },
    });

    return successResponse("Data loaded successfully", notifications, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
