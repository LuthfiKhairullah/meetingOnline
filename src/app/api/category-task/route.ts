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

      const existingCourse = await prisma.categoryTask.findUnique({
        where: { publicId },
      });
      if(!existingCourse) {
        publicIdExists = true;
      }
    }
    data.publicId = publicId;
    data.name = name;
  
    const showCourse = await prisma.categoryTask.create({
      data,
    });
  
    return successResponse("Data created successfully", showCourse, 200);
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
    const showCourse = await prisma.categoryTask.findMany({
      where: {
        deletedAt: null,
      }
    });

    return successResponse("Data loaded successfully", showCourse, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
