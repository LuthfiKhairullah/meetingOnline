export const runtime = "nodejs";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse, authUserResponse } from "@/lib/response";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { fullname, username, password, email } = await req.json();

    if (!fullname || !username || !password) {
      return errorResponse("Name, username, dan password wajib diisi", 400);
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
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullname,
        username,
        password: hashedPassword,
        email,
      },
    });
    
    return successResponse("Registrasi berhasil", authUserResponse(user), 201);
  } catch (error) {
    console.error(error);
    return errorResponse("Terjadi kesalahan server", 500);
  }
}
