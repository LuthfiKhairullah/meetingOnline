import jwt from "jsonwebtoken";
import { JwtUserPayload } from "./types/jwt";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyJwt(token: string): JwtUserPayload {
  return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
}

export function signJwtRefresh(payload: object) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyJwtRefresh(token: string): JwtUserPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtUserPayload;
}
