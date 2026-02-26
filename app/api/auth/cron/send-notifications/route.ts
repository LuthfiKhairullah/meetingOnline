import { NextResponse } from "next/server";
import admin from "@/lib/firebase";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }
    
    const now = new Date();

    const pending = await prisma.notification.findMany({
        where: {
            sendAt: { lte: now },
            sentAt: null,
        },
        include: {
            user: {
                include: {
                    userDevices: true,
                }
            },
            notificationType: true,
        }
    });

    for (const notif of pending) {
        for (const userDevice of notif.user.userDevices) {
            await admin.messaging().send({
                notification: {
                    title: notif.title,
                    body: notif.message,
                },
                token: userDevice.deviceId ?? undefined,
            });
        
            await prisma.notification.update({
                where: { id: notif.id },
                data: { sentAt: now },
            });
        }
    }

    return NextResponse.json({ success: true });
}