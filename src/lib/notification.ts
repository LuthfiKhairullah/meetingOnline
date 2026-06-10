import admin from "@/src/lib/firebase";
import prisma from "@/lib/prisma";
import { generatePublicId } from "@/src/lib/auth/crypto";

interface SendNotificationParams {
  userId: number;
  fcmToken?: string | null;
  title: string;
  message: string;
  categoryNotificationId?: number;
  categoryTaskId?: number;
  taskId?: number;
}

export async function sendNotification({
  userId,
  fcmToken,
  title,
  message,
  categoryNotificationId = 3,
  categoryTaskId = 3,
  taskId,
}: SendNotificationParams) {
  try {
    // simpan ke database
    await prisma.notification.create({
      data: {
        publicId: generatePublicId(),
        userId,
        title,
        description: message,
        sendAt: new Date(),
        timezone: "Asia/Jakarta",
        categoryNotificationId,
        categoryTaskId,
        taskId,
      },
    });

    // kirim push notification jika ada token
    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title,
          body: message,
        },
        android: {
          notification: {
            icon: "ic_launcher",
            color: "#1E88E5",
          },
        },
      });
    }
  } catch (error) {
    console.error("Send notification error:", error);
  }
}