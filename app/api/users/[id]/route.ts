import { Prisma } from "@/generated/prisma/client";
import { encryption, hashText } from "@/lib/auth/crypto";
import { requirePermission } from "@/lib/auth/requirePermission";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";
import { serializeUser } from "@/lib/serializers/user.serializer";
import bcrypt from "bcryptjs";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
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
    const { id } = await context.params;
    const users = await prisma.user.findFirst({
      where: {
        id: id,
        deletedAt: null
      },
      include: {
        userActivation: true,
        roles: true,
      }
    });

    const permissionList: String[] = [];
    const roleList: String[] = [];
    
    if(users != null) {
      for (const role of users.roles) {
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
    }
    
    const showUsers = users != null ? serializeUser(users, users.userActivation.name, permissionList, roleList) : null;

    return successResponse("Data loaded successfully", showUsers, 200);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}


export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }

  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["users.update"]);

  try {
    const { id } = await context.params;
  
    const { fullname, username, password, email } = await req.json();
    const usernameValue = username.trim();
    const fullnameValue = fullname.trim();
    const emailValue = email.trim();

    const data: any = {};
    
    if (!fullnameValue || !usernameValue) {
      return errorResponse("Name dan username wajib diisi", 400);
    }
    if(fullnameValue) {
      data.fullname = fullnameValue;
    }

    if(password) {
      if (password.length < 6) {
        return errorResponse("Password minimal 6 karakter", 400);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    const dataUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if(!dataUser) {
      return errorResponse("User tidak ditemukan", 409);
    }

    if(usernameValue && dataUser.username != usernameValue) {
      const existingUser = await prisma.user.findUnique({
        where: { username: usernameValue },
      });

      if (existingUser) {
        return errorResponse("Username sudah terdaftar", 409);
      }

      data.username = usernameValue;
    }

    if(emailValue) {
      const emailHash = hashText(emailValue);
      
      const existingEmail = await prisma.user.findFirst({
        where: { emailHash },
      });
      
      if (existingEmail) {
        return errorResponse("Email sudah digunakan", 409);
      }
  
      const emailEnc = encryption(emailValue);
      data.email = emailEnc;
      data.emailHash = emailHash;
    }

    await prisma.user.update({
      where: {
        id: id,
        deletedAt: null
      },
      data,
    });
    
    return successResponse("Update User berhasil", null, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("User not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }
    
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const types: string[] = JSON.parse(
    req.headers.get("x-user-type") || "[]"
  );
  
  if(!types.includes(process.env.USER_TYPE ?? '')) {
    return errorResponse("User not verified", 409);
  }
  
  const permissions: string[] = JSON.parse(
    req.headers.get("x-user-permissions") || "[]"
  );

  requirePermission(permissions, ["users.delete"]);

  try {
    const { id } = await context.params;
    await prisma.user.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      }
    });

    return successResponse("Data deleted successfully", 200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return errorResponse("User not found", 404);
        default:
          return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
}