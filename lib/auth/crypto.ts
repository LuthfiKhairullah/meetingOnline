import crypto from "crypto";

const algorithm = "aes-256-cbc";

const key = crypto
  .createHash("sha256")
  .update(process.env.PHONE_SECRET!)
  .digest("base64")
  .substring(0, 32);

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function encryption(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

export function decryption(text: string) {
  const [ivHex, encrypted] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  
  
  console.log(iv);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  console.log(text);

  return decrypted;
}

export function maskPhone(phone: string) {
  return phone.replace(/(\d{4})\d+(\d{4})/, "$1****$2");
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return name.slice(0, 3) + "***@" + domain;
}

export function hashText(text: string) {
  text = text + process.env.NODE_ENV;
  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex");
}
