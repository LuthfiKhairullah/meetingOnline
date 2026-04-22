import { generatePublicId, hashText } from "@/src/lib/auth/crypto";
import { signJwt, verifyJwt } from "@/src/lib/jwt";
import prisma from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/response";

export async function POST(req: Request) {
    try {
        const { publicId, platform, refreshToken, device } = await req.json();
        const { id, username, deviceId  } = await verifyJwt(refreshToken);

        let publicIdTemp = '';
        let exists = true;

        while (exists) {
            publicIdTemp = generatePublicId();

            const userDevice = await prisma.userDevice.findFirst({
                where: { publicId: publicIdTemp },
                select: { id: true }, // lebih ringan
            });

            exists = !!userDevice;
        }

        const storedToken = await prisma.userDevice.findUnique({
            where: {
                publicId: publicIdTemp,
                platform: platform,
                tokenId: hashText(refreshToken),
                deviceId: hashText(device),
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
                publicId: publicIdTemp,
                userId: storedToken.userId,
                platform: platform,
                user: username,
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