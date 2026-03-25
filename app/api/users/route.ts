import { encryption, generateToken, hashText } from "@/lib/auth/crypto";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import { serializeUser } from "@/lib/serializers/user.serializer";
import bcrypt from "bcryptjs";

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

  requirePermission(permissions, ["users.store"]);

  try {
    const { fullname, username, password, email } = await req.json();

    if (!fullname || !username || !password) {
      return errorResponse("Name, username, dan password wajib diisi", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password minimal 6 karakter", 400);
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return errorResponse("Username sudah terdaftar", 409);
    }

    const emailHash = hashText(email);
    
    const existingEmail = await prisma.user.findFirst({
      where: { emailHash },
    });
    
    if (existingEmail) {
      return errorResponse("Email sudah digunakan", 409);
    }

    const emailEnc = encryption(email);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullname,
        username,
        email: emailEnc,
        emailHash: emailHash,
        password: hashedPassword,
        userActivationId: 3,
      },
    });

    await prisma.userType.create({
      data: {
        userId: user.id,
        typeUserId: process.env.USER_TYPE ?? '',
      },
    });
    
    return successResponse("Registrasi berhasil", null, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Terjadi kesalahan server", 500);
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

  requirePermission(permissions, ["users.index"]);
  
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null
      },
      include: {
        userActivation: true,
        roles: true,
      }
    });

    const showUsers: any[] = [];
    for (const element of users) {
      const permissionList: String[] = [];
      const roleList: String[] = [];
      for (const role of element.roles) {
        const permission = await prisma.rolePermission.findMany({
          where: {
            roleId: role.roleId,
          },
          include: {
            permission: true,
          }
        });
        permission.forEach((permissionRole) => {
          permissionList.push(permissionRole.permission.code);
        });
        
        const roleDetail = await prisma.role.findFirst({
          where: {
            id: role.roleId,
          },
        });

        if(roleDetail != null) {
          roleList.push(roleDetail?.description ?? '');
        }
      }
      showUsers.push(serializeUser(element, element.userActivation.name, permissionList, roleList));
    }
    
    // users.forEach(element => {
    // });

    return successResponse("Data loaded successfully", showUsers, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
