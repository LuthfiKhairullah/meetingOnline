import { NextResponse } from "next/server";
import admin from "@/src/lib/firebase";
import prisma from "@/src/lib/prisma";
import { generatePublicId } from "@/src/lib/auth/crypto";

export async function GET(request: Request) {
    // if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response("Unauthorized", { status: 401 });
    // }
    
    const now = new Date();

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

    const pending = await prisma.notification.findMany({
        where: {
            sendAt: { lte: now },
            openAt: null,
        },
        include: {
            user: {
                include: {
                    userDevice: true,
                }
            },
        }
    });

    for (const notif of pending) {
        for (const userDevice of notif.user.userDevice) {
            await admin.messaging().send({
                notification: {
                    title: notif.title,
                    body: notif.description ?? '',
                },
                token: userDevice.deviceId ?? undefined,
            });
        
            await prisma.notification.update({
                where: { id: notif.id },
                data: { sendAt: now },
            });
        }
    }

    return NextResponse.json({ success: true });
}