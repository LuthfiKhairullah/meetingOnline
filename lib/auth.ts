export const runtime = "nodejs";

import prisma from "@/lib/prisma";

export async function getUserAccess(userId: string) {
  const roles = await prisma.userRole.findMany({
    where: {
      userId,
      user: {
        userActivationId: 3,
      }
    },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
      user: {
        include: {
          userTypes: true,
        }
      }
    },
  });

  const roleNames = roles.map(r => r.role.name);
  const permissions = roles.flatMap(r =>
    r.role.permissions.map(p => p.permission.code)
  );
  const userTypes = roles.flatMap(r =>
    r.user.userTypes.map(p => p.typeUserId)
  );

  return {
    roles: [...new Set(roleNames)],
    permissions: [...new Set(permissions)],
    userTypes: [...new Set(userTypes)],
  };
}
