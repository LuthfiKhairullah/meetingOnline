import { Prisma } from "@/generated/prisma/client";
import { decryption, encryption, hashText } from "@/lib/auth/crypto";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
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

  requirePermission(permissions, ["users.changeEmail"]);
  
  try {

    const { email } = await req.json();

    const idDecrypt = decryption(id);
    const idArray = idDecrypt.split('|');
    const idUser = idArray[0];

    const emailHash = hashText(email);
    
    const existingEmail = await prisma.user.findFirst({
      where: { emailHash },
    });
    
    if (existingEmail) {
      return errorResponse("Email sudah digunakan", 409);
    }

    const emailEnc = encryption(email);
    
    await prisma.user.update({
      where: {
        id: idUser,
        deletedAt: null
      },
      data : {
        email: emailEnc,
        emailHash: emailHash,
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