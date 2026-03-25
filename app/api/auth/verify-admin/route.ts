import { Prisma } from "@/generated/prisma/client";
import { decryption, encryption } from "@/lib/auth/crypto";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import { generateNik } from "@/lib/serializers/nik.serializer";

export async function POST(req: Request, { params }: any) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }
  
  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["verify-admin.store"]);
  
  try {
    const body = await req.json();
    
    const decryptId = decryption(body.id);
    const arrId = decryptId.split('|');
    if(arrId.length != 2) {
        return errorResponse('Error invalid user', 409);
    }

    const id = arrId[0];
    const username = arrId[1];

    const user = await prisma.user.findFirst({
      where: {
        id: id,
        username: username,
        deletedAt: null,
      },
    });

    if(!user) {
        return errorResponse('Error invalid user', 409);
    }
    
    const nik = await generateNik();

    const userUpdate = await prisma.user.update({
      where: { id },
      data : {
        otp: null,
        otpExpired: null,
        userActivationId: 3,
        nik,
      },
    });

    return successResponse("Data updated successfully", null, 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("Notification not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }
    
    return errorResponse("Internal server error", 500);
  }
}