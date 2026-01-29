export const runtime = "nodejs";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";
import { authUserResponse, errorResponse, successLoginResponse, successResponse } from "@/lib/response";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return errorResponse("Username dan password wajib diisi", 400);
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return errorResponse("Username atau password salah", 401);
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return errorResponse("Username atau password salah", 401);
  }

  const token = signJwt({
    id: user.id,
    username: user.username,
  });

  return successLoginResponse("Login berhasil", token, authUserResponse(user), 201);
}
