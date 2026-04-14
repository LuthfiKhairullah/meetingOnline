import { Prisma } from "@/generated/prisma/client";
import { decryption, encryption, generatePublicId } from "@/src/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";
import { generateNik } from "@/src/lib/serializers/nik.serializer";

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

    const user = await prisma.user.findFirst({
      where: {
        publicId,
        username: username,
        deletedAt: null,
      },
    });

    if(!user) {
        return errorResponse('Error invalid user', 409);
    }

    let nik = generateNik();
    console.log(nik);

    await prisma.user.update({
      where: { publicId },
      data : {
        otp: null,
        otpExpired: null,
        userActivationId: 3,
        // nik: nik ?? ''
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