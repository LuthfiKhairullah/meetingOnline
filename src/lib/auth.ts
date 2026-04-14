export const runtime = "nodejs";

import prisma from "@/src/lib/prisma";

export async function getUserAccess(userId: string) {
  const roles = await prisma.userRole.findMany({
    where: {
      userId: parseInt(userId),
      user: {
        userActivationId: 3,
      }
    },
    include: {
      role: {
        include: {
          rolePermission: {
            include: { permission: true },
          },
        },
      },
      user: true,
    },
  });

  const roleNames = roles.map(r => r.role.name);
  const permissions = roles.flatMap(r =>
    r.role.rolePermission.map(p => p.permission.code)
  );
  const userTypes = roles.flatMap(r =>
    r.user.userTypeId
  );

  return {
    roles: [...new Set(roleNames)],
    permissions: [...new Set(permissions)],
    userTypes: [...new Set(userTypes)],
  };
}
