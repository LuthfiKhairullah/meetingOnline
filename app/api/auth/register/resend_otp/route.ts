export const runtime = "nodejs";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse, authUserResponse } from "@/lib/response";
import prisma from "@/lib/prisma";
import { encryption, generateToken, hashText } from "@/lib/auth/crypto";

export async function POST(req: Request) {
  try {
    const { fullname, username, password, email } = await req.json();

    if (!fullname || !username || !password) {
      return errorResponse("Name, email, username, dan password wajib diisi", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password minimal 6 karakter", 400);
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return errorResponse("Username sudah terdaftar", 409);
    }

    const emailHash = hashText(email);
    
    const existingEmail = await prisma.user.findFirst({
      where: { emailHash },
    });
    
    if (existingEmail) {
      return errorResponse("Email sudah digunakan", 409);
    }

    const otp = generateToken();
    const otpEnc = encryption(otp);
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 menit
    
    const emailEnc = encryption(email);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    // await transporter.sendMail({
    //   from: `"System" <${process.env.EMAIL_USER}>`,
    //   to: email,
    //   subject: "Kode OTP Anda",
    //   html: `
    //     <h2>OTP Verification</h2>
    //     <p>Kode OTP Anda:</p>
    //     <h1>${otp}</h1>
    //     <p>Berlaku selama 5 menit.</p>
    //   `,
    // });

    const user = await prisma.user.create({
      data: {
        fullname,
        username,
        email: emailEnc,
        emailHash: emailHash,
        password: hashedPassword,
        userActivationId: 1,
        otp: otpEnc,
        otpExpired: expiry,
      },
    });
    
    return successResponse("Registrasi berhasil, kode OTP terkirim ke email anda", null, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
