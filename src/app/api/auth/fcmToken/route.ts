import { generatePublicId, hashText } from "@/src/lib/auth/crypto";
import { requirePermission } from "@/src/lib/auth/requirePermission";
import { signJwt, verifyJwt } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function POST(req: Request) {
    try {
        const { publicId, platform, refreshToken, device } = await req.json();
        const { id, username, deviceId } = await verifyJwt(refreshToken);

        const storedToken = await prisma.userDevice.findUnique({
            where: {
                publicId: publicId,
                platform: platform,
                tokenId: hashText(refreshToken),
                deviceId: hashText(deviceId),
            },
            include: {
                user: {
                    include: {
                        userRole: {
                            include: {
                                role: {
                                    include: {
                                        rolePermission: {
                                            include: {
                                                permission: true,
                                            }
                                        },
                                    }
                                },
                            }
                        },
                    }
                },
            }
        });

        if (!storedToken || id !== storedToken.userId || username !== storedToken.user.username) {
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

        const arrRole = [
            ...new Set(
                (storedToken.user?.userRole ?? [])
                .map((item) => item?.role?.name?.toUpperCase())
                .filter(Boolean)
            ),
        ];
        
        const arrPermission = [
            ...new Set(
                (storedToken?.user?.userRole ?? [])
                .flatMap((ur) => ur.role?.rolePermission ?? [])
                .map((rp) => rp.permission?.code?.toUpperCase())
                .filter(Boolean)
            ),
        ];

        const newAccessToken = await signJwt({
            id: storedToken.id,
            username: storedToken.user.username,
            role: arrRole,
            permsision: arrPermission,
        });

        const newRefreshToken = await signJwt({
            id: storedToken.id,
            username: storedToken.user.username,
            deviceId: device,
            role: arrRole,
            permsision: arrPermission,
        });

        const date = new Date();
        date.setDate(date.getDate() + 7);

        await prisma.userDevice.create({
            data: {
                publicId: generatePublicId(),
                userId: storedToken.userId,
                platform: platform,
                deviceId: hashText(device),
                tokenId: hashText(newRefreshToken),
                deletedAt: date,
            },
        });

        return successResponse("FCM Token Refreshed", {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }, 201);
    } catch {
        return errorResponse("Invalid token", 401);
    }
}