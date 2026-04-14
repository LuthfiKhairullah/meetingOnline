import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

type Metrics = {
  users: number;
  classes: number;
  teachers: number;
};

export async function GET(req: Request) {
  try {
    const dashboardMetrics: Metrics = {
      users: 0,
      classes: 0,
      teachers: 0,
    };
    const users = await prisma.user.count({
      where: {
        deletedAt: null,
      },
    });
    const classes = await prisma.class.count();
    const teachers = await prisma.user.count({
      where: {
        userRole: {
          some: {
            role: {
              name: 'Teacher'
            }
          }
        },
        deletedAt: null,
      },
    });

    dashboardMetrics.users = users;
    dashboardMetrics.classes = classes;
    dashboardMetrics.teachers = teachers;

    console.log(dashboardMetrics)

    return successResponse("Data loaded successfully", dashboardMetrics, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
