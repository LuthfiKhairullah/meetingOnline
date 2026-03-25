import { requirePermission } from "@/lib/auth/requirePermission";
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
  
    requirePermission(permissions, ["murajaahEvents.store"]);

    await prisma.murajaahEvent.create({
      data: {
        userId: userId,
        createdById: userId,
        updatedById: userId,
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
    const murajaahEvents = await prisma.murajaahEvent.findMany({
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

