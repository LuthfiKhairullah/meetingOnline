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
    const { fullname, username, password, alamat, noHp, nik, email } = await req.json();

    if (!fullname || !username || !password) {
      return errorResponse("Name, username, and password is required", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password minimal 6 karakter", 400);
    }

    const usernameValue = username.trim();
    const fullnameValue = fullname.trim();
    
    const existingUser = await prisma.user.findUnique({
      where: { username: usernameValue },
    });

    if (existingUser) {
      return errorResponse("Username sudah terdaftar", 409);
    }

    const emailValue = email ? email.trim() : null;
    const noHpValue = noHp ? noHp.trim() : null;
    const alamatValue = alamat ? alamat.trim() : null;
    const nikValue = nik ? nik.trim() : null;

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
    data.fullname = fullnameValue;
    data.username = usernameValue;
    data.password = hashedPassword;
    data.userActivationId = 3;
    data.email = '';
    data.emailHash = '';

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

    if(noHpValue) {
      const existingNoHp = await prisma.user.findFirst({
        where: { noHp },
      });
      
      if (existingNoHp) {
        return errorResponse("No Hp sudah digunakan", 409);
      }
      data.noHp = noHpValue;
    }

    if(alamatValue) {
      data.alamat = alamatValue;
    }

    if(nikValue) {
      const existingNik = await prisma.user.findFirst({
        where: { nik: nikValue },
      });
      
      if (existingNik) {
        return errorResponse("NIK sudah digunakan", 409);
      }
      data.nik = nikValue;
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
