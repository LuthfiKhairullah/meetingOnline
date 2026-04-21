import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const showCategoryTask = await prisma.categoryTask.findMany({
      where: {
        deletedAt: null,
      }
    });

    const showCategoryTasks = showCategoryTask.map((t) => ({
      id: t.id,
      name: t.name,
    }))

    return successResponse("Data loaded successfully", showCategoryTasks, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
