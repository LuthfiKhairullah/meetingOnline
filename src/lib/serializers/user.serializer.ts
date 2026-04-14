import { User } from "@/generated/prisma/client";
import { decryption, encryption, maskEmail, maskPhone } from "../auth/crypto";

type UserRole = {
  id: number;
  name: string;
};

export function serializeUser(user: User, userStatus: String, userPermission: String[], userRole: UserRole[]) {
  return {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    alamat: user.alamat,
    email: (user.email && ((user.email ?? '') != '')) ? maskEmail(decryption(user.email)) : null,
    noHp: (user.noHp && ((user.noHp ?? '') != '')) ? maskPhone(user.noHp) : null,
    nik: user.nik,
    userStatus: userStatus,
    userPermission: userPermission,
    userRole: userRole,
  };
}