export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import { signJwt } from "@/lib/jwt";
import { authUserResponse, errorResponse, successLoginResponse, successResponse } from "@/lib/response";
import prisma from "@/lib/prisma";
import { serializeUser } from "@/lib/serializers/user.serializer";
import { hashText } from "@/lib/auth/crypto";
import admin from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { username, password, fcmToken, platform } = await req.json();
  
    if (!username || !password) {
      return errorResponse("Username dan password wajib diisi", 400);
    }
  
    let user = await prisma.user.findUnique({
      where: {
        username,
        deletedAt: null,
      },
    });
  
    if (!user) {
      return errorResponse("Username atau password salah", 401);
    } else {
      if (user.userActivationId != 3) {
        return errorResponse("User not verified", 401);
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
  
    const userDevice = await prisma.userDevice.create({
      data: {
        userId: user.id,
        platformId: platform,
        deviceId: hashText(fcmToken),
        tokenId: hashText(refreshToken),
        deletedAt: date,
      },
    });
  
    const showUser = serializeUser(user);
  
    const notifTitle = 'Login Success';
    const notifMessage = 'Welcome to Apps';
    const notifType = 1;
  
    const notificationType = await prisma.notificationType.findUnique({
      where: {
        id: 1,
      }
    });
  
    const firebase = await admin.messaging().send({
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
  
    const notif = await prisma.notification.create({
      data: {
        userId: user.id,
        title: notifTitle,
        notificationTypeId: notifType,
        message: notifMessage,
        sendAt: new Date(),
      },
    });
  
    return successLoginResponse("Login berhasil", token, authUserResponse(userDevice.publicId, refreshToken, token, showUser), 201);
  } catch (error: any) {
    return errorResponse(error.message, 409);
  }
}
