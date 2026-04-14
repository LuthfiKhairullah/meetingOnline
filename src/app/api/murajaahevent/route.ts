import { generatePublicId } from "@/src/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
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
  
    requirePermission(permissions, ["murajaahEvents.store"]);

    let publicId = '';
    let exists = true;

    while (exists) {
      publicId = generatePublicId();

      const userDevice = await prisma.userDevice.findFirst({
        where: { publicId },
        select: { id: true }, // lebih ringan
      });

      exists = !!userDevice;
    }

    await prisma.murajaah.create({
      data: {
        taskId: 1,
        publicId: publicId,
        userId: parseInt(userId),
        createdAt: userId,
        createdById: parseInt(userId),
        date: new Date(),
      },
    });
  
    return successResponse("Data created successfully", null, 200);
  } catch (error: any) {
    console.log(error.message);
    return errorResponse(error.message, 409);
  }
}

export async function GET(req: Request) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }
  
  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );
  
  requirePermission(permissions, ["murajaahEvents.index"]);

  try {
    const body = await req.json();
    const murajaahEvents = await prisma.murajaah.findMany({
      where: {
        date: {
          gte: body.startDate,
          lt: body.endDate,
        },
      },
    });

    return successResponse("Data loaded successfully", murajaahEvents, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}

