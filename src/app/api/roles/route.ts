import { generatePublicId } from "@/src/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import { requireRole } from "@/src/lib/auth/requireRole";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function POST(req: Request) {
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }
  
  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );
  
  // requirePermission(permissions, ["roles.store"]);

  try {
    const body = await req.json();

    let publicId = '';
    let exists = true;

    while (exists) {
      publicId = generatePublicId();

      const role = await prisma.role.findFirst({
        where: { publicId },
        select: { id: true }, // lebih ringan
      });

      exists = !!role;
    }
  
    const role = await prisma.role.create({
      data: {
        publicId,
        name: body.name,
      },
    });
  
    return successResponse("Data created successfully", role, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}

export async function GET(req: Request) {
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }

  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );

  // requirePermission(permissions, ["roles.index"]);

  try {
    const roles = await prisma.role.findMany();

    return successResponse("Data loaded successfully", roles, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
