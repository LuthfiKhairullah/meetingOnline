import { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import { generateNik } from "@/lib/serializers/nik.serializer";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }

  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["users.activateUser"]);
  
  try {
    const { id } = await context.params;
    const nik = await generateNik();
    
    await prisma.user.update({
      where: {
        id: id,
        deletedAt: null
      },
      data : {
        otp: null,
        otpExpired: null,
        userActivationId: 3,
        nik,
      },
    });
    
    return successResponse("Activate User berhasil", null, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("User not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }
    
    return errorResponse("Internal server error", 500);
  }
}