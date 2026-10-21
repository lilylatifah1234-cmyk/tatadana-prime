import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const DEFAULT_SECRET = process.env.ENCRYPTION_KEY || "tatadana-master-encryption-key-32-byte-secret!!";

function getKey(): Buffer {
  return crypto.createHash("sha256").update(DEFAULT_SECRET).digest();
}

/**
 * Mengenkripsi teks sensitif (seperti token bot Telegram) menggunakan AES-256-GCM
 */
export function encryptText(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Mendekripsi string terenkripsi AES-256-GCM
 */
export function decryptText(cipherPayload: string): string {
  try {
    const parts = cipherPayload.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid cipher payload format");
    }
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];

    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Gagal mendekripsi payload:", error);
    return "";
  }
}
