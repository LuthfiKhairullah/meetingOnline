import { generatePublicId } from "@/lib/auth/crypto";
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

  // requirePermission(permissions, ["permissions.store"]);

  try {
    const { name } = await req.json();

    const data: any = {};
    let publicIdExists = false;
    let publicId = '';
    while (publicIdExists == false) {
      publicId = generatePublicId();

      const existingClass = await prisma.class.findUnique({
        where: { publicId },
      });
      if(!existingClass) {
        publicIdExists = true;
      }
    }
    data.publicId = publicId;
    data.name = name;
  
    const showClass = await prisma.class.create({
      data,
    });
  
    return successResponse("Data created successfully", showClass, 200);
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

  // requirePermission(permissions, ["permissions.index"]);

  try {
    const showClass = await prisma.class.findMany();

    return successResponse("Data loaded successfully", showClass, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
