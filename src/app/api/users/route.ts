import { encryption, generatePublicId, generateToken, hashText } from "@/src/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";
import { serializeUser } from "@/src/lib/serializers/user.serializer";
import bcrypt from "bcryptjs";

type UserRole = {
  id: number;
  name: string;
};

export async function POST(req: Request) {
  // const types: string[] = JSON.parse(
  //   req.headers.get("x-user-type") || "[]"
  // );
  // if(!types.includes(process.env.USER_TYPE ?? '')) {
  //   return errorResponse("User not verified", 409);
  // }

  // const permissions: string[] = JSON.parse(
  //   req.headers.get("x-user-permissions") || "[]"
  // );

  // requirePermission(permissions, ["users.store"]);

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
    console.log(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    const data: any = {};
    let publicIdExists = false;
    let publicId = '';
    while (publicIdExists == false) {
      publicId = generatePublicId();

      const existingUser = await prisma.user.findUnique({
        where: { publicId },
      });
      if(!existingUser) {
        publicIdExists = true;
      }
    }
    data.publicId = publicId;
    data.fullname = fullname;
    data.username = username;
    data.password = hashedPassword;
    data.userActivationId = 3;
    data.email = '';
    data.emailHash = '';

    if(email && email != "") {
      const emailHash = hashText(email);
      
      const existingEmail = await prisma.user.findFirst({
        where: { emailHash },
      });
      
      if (existingEmail) {
        return errorResponse("Email sudah digunakan", 409);
      }
  
      const emailEnc = encryption(email);

      data.email = emailEnc;
      data.emailHash = emailHash;
    }
    
    const user = await prisma.user.create({
      data: data,
    });
    
    return successResponse("Registrasi berhasil", null, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}

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

  // requirePermission(permissions, ["users.index"]);
  
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null
      },
      include: {
        userActivation: true,
        userRole: true,
      }
    });

    const showUsers: any[] = [];
    for (const element of users) {
      const permissionList: String[] = [];
      const roleList: UserRole[] = [];
      for (const role of element.userRole) {
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
          roleList.push({
            id: roleDetail?.id ?? '',
            name: roleDetail?.name ?? ''
          });
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
