import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET = process.env.PHONE_SECRET;

if (!SECRET) {
  throw new Error("PHONE_SECRET is not defined");
}

// derive key (32 byte)
const key = crypto.scryptSync(SECRET, "salt", 32);

// ================= TOKEN =================
export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// ================= ENCRYPT =================
export function encryption(text: string) {
  const iv = crypto.randomBytes(12); // GCM pakai 12 byte
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // format: iv:tag:data
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

// ================= DECRYPT =================
export function decryption (payload: string) {
  const parts = payload.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload");
  }

  const [ivBase64, tagBase64, dataBase64] = parts;

  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(tagBase64, "base64");
  const encrypted = Buffer.from(dataBase64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// ================= HASH =================
export function hashText(text: string) {
  return crypto
    .createHmac("sha256", SECRET!)
    .update(text)
    .digest("hex");
}

// ================= MASK =================
export function maskPhone(phone: string) {
  return phone.replace(/(\d{4})\d+(\d{4})/, "$1****$2");
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");

  if (!name || !domain) return email;

  return name.slice(0, 3) + "***@" + domain;
}

// ================= PUBLIC ID =================
export function generatePublicId(prefix = "usr") {
  const random = crypto.randomBytes(8).toString("hex");
  const timestamp = Date.now().toString(36);

  return `${prefix}-${timestamp}-${random}`;
}