import { requirePermission } from "@/lib/auth/requirePermission";
import { requireRole } from "@/lib/auth/requireRole";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }
  
  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );
  
  requirePermission(permissions, ["roles.store"]);

  try {
    const body = await req.json();
  
    const role = await prisma.role.create({
      data: {
        name: body.name,
        description: body.description,
      },
    });
  
    return successResponse("Data created successfully", role, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}

export async function GET(req: Request) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }

  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["roles.index"]);

  try {
    const roles = await prisma.role.findMany();

    return successResponse("Data loaded successfully", roles, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
