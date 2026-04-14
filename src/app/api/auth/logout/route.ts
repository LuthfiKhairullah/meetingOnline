import { decryption, hashText } from "@/src/lib/auth/crypto";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
    const { publicId, platform, device, userId } = await req.json();

    const publicToken = decryption(publicId);
    const storedToken = decryption(userId);
    const arrToken = storedToken.split("|");
    const userIdToken = parseInt(arrToken[0]);

    await prisma.userDevice.deleteMany({
        where: {
            publicId: publicToken,
            platform: platform,
            userId: userIdToken ?? '',
            deviceId: hashText(device),
        },
    });

    return Response.json({ message: "Logged out success" });
}