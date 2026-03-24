import { Prisma } from "@/generated/prisma/client";
import { decryption } from "@/lib/auth/crypto";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const types: string[] = JSON.parse(
      req.headers.get("x-user-type") || "[]"
    );
    if(!types.includes(process.env.USER_TYPE ?? '')) {
      return errorResponse("User not verified", 409);
    }
  
    const permissions: string[] = JSON.parse(
      req.headers.get("x-user-permissions") || "[]"
    );
  
    requirePermission(permissions, ["users.changePassword"]);

    const { password, passwordConfirm } = await req.json();

    if(password != passwordConfirm) {
      return errorResponse("Password dan Confirm Password tidak sama", 400);
    }

    const idDecrypt = decryption(id);
    const idArray = idDecrypt.split('|');
    const idUser = idArray[0];

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.update({
      where: {
        id: idUser,
        deletedAt: null
      },
      data : {
        password: hashedPassword
      },
    });
    
    return successResponse("Change Password berhasil", null, 201);
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