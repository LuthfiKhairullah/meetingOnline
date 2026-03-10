import { decryption, hashText } from "@/lib/auth/crypto";
import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();

        if (!token) {
            return errorResponse("Invalid token", 404);
        }
        
        let tokenDec = decryption(token);
        let tokenHash = hashText(tokenDec);
        // return successResponse("Invalid or used token", tokenHash, 404);

        const user = await prisma.user.findFirst({
            where: {
                otp: tokenHash,
            },
        });

        if (!user) {
            return errorResponse("Invalid or used token", 404);
        } else {
            if(user.userActivationId > 1) {
                return successResponse("Email successfully verified, waiting approval administrator", null, 201);
            }
        }

        if (!user.otpExpired || user.otpExpired < new Date()) {
            return errorResponse("Token expired", 404);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                userActivationId: 2,
                otp: null,
                otpExpired: null,
            },
        });

        return successResponse("Email successfully verified, waiting approval administrator", null, 201)
    } catch (error) {
        console.error(error);
        return errorResponse("Terjadi kesalahan server", 500);
    }
}