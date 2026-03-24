export const runtime = "nodejs";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse } from "@/lib/response";
import prisma from "@/lib/prisma";
import { encryption, generateToken, hashText } from "@/lib/auth/crypto";
import { sendEmail } from "@/lib/auth/mailer";

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
    const otpHash = hashText(otp);
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 menit
    
    const emailEnc = encryption(email);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${otpEnc}`;

    await sendEmail({
      to: [
        {
          name: fullname,
          email: email,
        }
      ],
      subject: 'Verify Your Email',
      htmlContent: `
        <h2>Email Verification</h2>
        <p>Klik tombol di bawah untuk verifikasi:</p>
        <a href="${verifyLink}" 
          style="padding:10px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
        <p>Link berlaku 5 menit.</p>
      `,
    });

    // await transporter.sendMail({
    //   to: email,
    //   subject: "Verify Your Email",
    //   html: `
    //     <h2>Email Verification</h2>
    //     <p>Klik tombol di bawah untuk verifikasi:</p>
    //     <a href="${verifyLink}" 
    //       style="padding:10px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
    //       Verify Email
    //     </a>
    //     <p>Link berlaku 5 menit.</p>
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
        otp: otpHash,
        otpExpired: expiry,
      },
    });

    await prisma.userType.create({
      data: {
        userId: user.id,
        typeUserId: process.env.USER_TYPE ?? '',
      },
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: '033d9f73-2656-4ec7-8a1c-336722766bc3',
      },
    });
    
    return successResponse("Registrasi berhasil, verifikasi email anda", null, 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
