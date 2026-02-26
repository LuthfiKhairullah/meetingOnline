import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
  const userId = req.headers.get("x-user-id")!;
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }
  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );

  // requirePermission(permissions, ["murajaahEvents.store"]);

  const murajaahEvent = await prisma.murajaahEvent.create({
    data: {
      userId: userId,
      createdById: userId,
      updatedById: userId,
      date: new Date(),
    },
  });

  return successResponse("Data created successfully", null, 200);
}
