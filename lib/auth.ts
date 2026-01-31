export const runtime = "nodejs";

import prisma from "@/lib/prisma";

export async function getUserAccess(userId: string) {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  const roleNames = roles.map(r => r.role.name);
  const permissions = roles.flatMap(r =>
    r.role.permissions.map(p => p.permission.code)
  );

  return {
    roles: [...new Set(roleNames)],
    permissions: [...new Set(permissions)],
  };
}
