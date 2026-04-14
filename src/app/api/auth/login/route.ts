export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import { signJwt } from "@/src/lib/jwt";
import { authUserResponse, errorResponse, successLoginResponse, successResponse } from "@/src/lib/response";
import prisma from "@/src/lib/prisma";
import { serializeUser } from "@/src/lib/serializers/user.serializer";
import { encryption, generatePublicId, hashText } from "@/src/lib/auth/crypto";
import admin from "@/src/lib/firebase";

type UserRole = {
  id: number;
  name: string;
};

export async function POST(req: Request) {
  try {
    const { username, password, fcmToken, platform } = await req.json();
  
    if (!username || !password) {
      return errorResponse("Username dan password wajib diisi", 400);
    }
  
    let user = await prisma.user.findFirst({
      where: {
        username,
        deletedAt: null,
      },
      include: {
        userActivation: true,
        userRole: true,
      }
    });

    console.log(user);
  
    if (!user) {
      return errorResponse("Username atau password salah", 401);
    } else {
      if (user.userActivationId != 3) {
        return errorResponse("User not verified", 401);
      }
    }

    const permissionList: String[] = [];
    const roleList: UserRole[] = [];

    if(user != null) {
      for (const role of user.userRole) {
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
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return errorResponse("Username atau password salah", 401);
    }
    
    const token = signJwt({
      id: user.id,
      username: user.username,
    });
    
    const refreshToken = signJwt({
      id: user.id,
      username: user.username,
      deviceId: fcmToken,
    });
    
    const date = new Date();
    date.setDate(date.getDate() + 7);
    
    let publicId = '';
    let exists = true;

    while (exists) {
      publicId = generatePublicId();

      const userDevice = await prisma.userDevice.findFirst({
        where: { publicId },
        select: { id: true }, // lebih ringan
      });

      exists = !!userDevice;
    }

    const userDevice = await prisma.userDevice.create({
      data: {
        publicId: publicId,
        userId: user.id,
        platform: platform,
        deviceId: fcmToken ? hashText(fcmToken) : '',
        tokenId: hashText(refreshToken),
      },
    });
    
    const showUser = serializeUser(user, user.userActivation.name, permissionList, roleList);
    
    const notifTitle = 'Login Success';
    const notifMessage = 'Welcome to Apps';
    const notifType = 1;

    if(fcmToken != null) {
      await admin.messaging().send({
          notification: {
              title: notifTitle,
              body: notifMessage,
          },
          token: fcmToken,
          android: {
            notification: {
              icon: "ic_launcher", // TANPA .png
              color: "#1E88E5",
            },
          },
      });

      await prisma.notification.create({
        data: {
          publicId: generatePublicId(),
          userId: user.id,
          title: notifTitle,
          description: notifMessage,
          sendAt: new Date(),
          timezone: 'Asia/Jakarta',
          categoryNotificationId: 3,
        },
      });
    }
  
  
    return successLoginResponse("Login berhasil", token, authUserResponse(encryption(userDevice.publicId), refreshToken, token, showUser), 201);
  } catch (error: any) {
    console.log(error);
    return errorResponse(error.message, 409);
  }
}
