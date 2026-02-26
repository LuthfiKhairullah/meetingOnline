import { decryption, hashText } from "@/lib/auth/crypto";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const { publicId, platform, device, userId } = await req.json();

    const storedToken = decryption(userId);
    const arrToken = storedToken.split("|");
    const userIdToken = arrToken[0];

    await prisma.userDevice.deleteMany({
        where: {
            publicId: publicId,
            platformId: platform,
            userId: userIdToken,
            deviceId: hashText(device),
        },
    });

    return Response.json({ message: "Logged out success" });
}