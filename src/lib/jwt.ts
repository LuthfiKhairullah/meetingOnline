import jwt from "jsonwebtoken";
import { JwtUserPayload } from "./types/jwt";
import { jwtVerify , SignJWT } from 'jose'


// const JWT_SECRET = process.env.JWT_SECRET!;
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET)

// export function signJwt(payload: object) {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
// }

export async function signJwt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(JWT_SECRET)
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET)
  return payload as JwtUserPayload
}
// export function verifyJwt(token: string): JwtUserPayload {
//   return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
// }

export async function signJwtRefresh(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}
// export function signJwtRefresh(payload: object) {
//   return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
// }

export async function verifyJwtRefresh(token: string) {
  const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET)
  return payload as JwtUserPayload
}
// export function verifyJwtRefresh(token: string): JwtUserPayload {
//   return jwt.verify(token, JWT_REFRESH_SECRET) as JwtUserPayload;
// }
