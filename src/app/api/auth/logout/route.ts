import { verifyJwt } from "@/lib/jwt";
import { successResponse } from "@/lib/response";
import { decryption, hashText } from "@/src/lib/auth/crypto";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
    // const { publicId, platform, device, userId } = await req.json();

    // const publicToken = decryption(publicId);
    // const storedToken = decryption(userId);
    // const arrToken = storedToken.split("|");
    // const userIdToken = parseInt(arrToken[0]);
    const token = req.headers.get("authorization");
    const thisToken = token?.split('Bearer ')[1];
    console.log(thisToken);
    
    const { id, username, role, permission } = await verifyJwt(thisToken ?? '');
    const { platform, device } = await req.json();

    await prisma.userDevice.deleteMany({
        where: {
            platform: platform,
            userId: id,
            deviceId: device ? hashText(device) : '',
        },
    });
    
    const response = successResponse("Logged out success", 201);
    
    const clientType = req.headers.get("x-client-type");

    if(clientType == 'web') {
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            expires: new Date(0),
        });

        response.cookies.set("x-client-type", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            expires: new Date(0),
        });
    }


    return response;
}