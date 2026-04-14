import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function POST(req: Request) {
  // const userId = req.headers.get("x-user-id")!;
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }

  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );
  
  // requirePermission(permissions, ["userActivation.store"]);

  const body = await req.json();

  const isExists = await prisma.userActivation.findFirst({
    where: {
      name: body.name,
    },
  });

  if (isExists) {
      return errorResponse("User Activation exists", 409);
  }

  const userActivation = await prisma.userActivation.create({
    data: {
      name: body.name,
    },
  });

  return successResponse("Data created successfully", userActivation, 200);
}

export async function GET(req: Request) {
  try {
    // const roles: string[] = JSON.parse(
    //   req.headers.get("x-user-roles") || "[]"
    // );
    const permissions: string[] = JSON.parse(
      req.headers.get("x-user-permissions") || "[]"
    );

    requirePermission(permissions, ["userActivation.index"]);

    const userActivations = await prisma.userActivation.findMany({
      include: {
        users: true,
      },
    });

    return successResponse("Data loaded successfully", userActivations, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
