import { User } from "@/generated/prisma/client";
import { decryption, encryption, maskEmail, maskPhone } from "../auth/crypto";

export function serializeUser(user: User, userStatus: String, userPermission: String[], userRole: String[]) {
  return {
    id: encryption(user.id + '|' + user.username),
    username: user.username,
    fullname: user.fullname,
    alamat: user.alamat,
    email: (user.email && ((user.email ?? '') != '')) ? maskEmail(decryption(user.email)) : null,
    noHp: (user.noHp && ((user.noHp ?? '') != '')) ? maskPhone(decryption(user.noHp)) : null,
    nik: user.nik,
    userStatus: userStatus,
    userPermission: userPermission,
    userRole: userRole,
  };
}