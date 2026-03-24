import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id")!;
    const types: string[] = JSON.parse(
      req.headers.get("x-user-type") || "[]"
    );
  
    if(!types.includes(process.env.USER_TYPE ?? '')) {
      return errorResponse("User not verified", 409);
    }
    const permissions: string[] = JSON.parse(
      req.headers.get("x-user-permissions") || "[]"
    );
  
    requirePermission(permissions, ["murajaahEvents.today"]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
  
    const murajaahEvent = await prisma.murajaahEvent.findFirst({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        userId: userId,
      },
    });
  
    let murajaahToday = false;
    if(murajaahEvent) {
      murajaahToday = true;
    }
  
    return successResponse("Data loaded successfully", {
      'done': murajaahToday,
    }, 200);
  } catch (error: any) {
    console.log('error.message, 409');
    return errorResponse(error.message, 409);
  }
}
