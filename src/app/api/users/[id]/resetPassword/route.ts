import { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";
import bcrypt from "bcryptjs";

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

  requirePermission(permissions, ["users.resetPassword"]);
  
  try {
    const { id } = await context.params;
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    await prisma.user.update({
      where: {
        id: parseInt(id),
        deletedAt: null
      },
      data : {
        password: hashedPassword
      },
    });
    
    return successResponse("Reset Password berhasil", null, 201);
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