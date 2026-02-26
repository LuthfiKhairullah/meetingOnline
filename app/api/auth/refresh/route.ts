import { hashText } from "@/lib/auth/crypto";
import { signJwt, verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
    const { publicId, platform, refreshToken, device } = await req.json();

    try {
        const { id, username, deviceId  } = verifyJwt(refreshToken);

        const storedToken = await prisma.userDevice.findUnique({
            where: {
                publicId: publicId,
                platformId: platform,
                tokenId: hashText(refreshToken),
                deviceId: hashText(device),
            },
            include: {
                user: true,
            }
        });

        if (!storedToken || storedToken.deviceId !== hashText(device) || id !== storedToken.userId || hashText(deviceId) !== storedToken.deviceId || username !== storedToken.user.username) {
            return errorResponse("Invalid token", 401);
        }

        if (!storedToken.deletedAt || (storedToken.deletedAt ?? '') < new Date()) {
            return errorResponse("Invalid token expired", 401);
        }

        await prisma.userDevice.delete({
            where: {
                id: storedToken.id,
            },
        });

        const newAccessToken = signJwt({
            id: storedToken.id,
            username: storedToken.user.username,
        });

        const newRefreshToken = signJwt({
            id: storedToken.id,
            username: storedToken.user.username,
            deviceId: device,
        });

        const date = new Date();
        date.setDate(date.getDate() + 7);

        await prisma.userDevice.create({
            data: {
                userId: storedToken.userId,
                platformId: platform,
                deviceId: hashText(device),
                tokenId: hashText(newRefreshToken),
                deletedAt: date,
            },
        });

        return successResponse("Token Refreshed", {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }, 201);
    } catch {
        return errorResponse("Invalid token", 401);
    }
}