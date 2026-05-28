// TEXA Military-Grade Encryption Service
// Signal Protocol-inspired: AES-256-GCM, X25519, Ed25519, Double Ratchet
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

/**
 * Derives a 256-bit key from a passphrase using PBKDF2 with SHA-512.
 */
export function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(passphrase, salt, 210000, KEY_LENGTH, "sha512");
}

/**
 * Generates a cryptographically secure random salt.
 */
export function generateSalt(): Buffer {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * AES-256-GCM Encryption.
 * Returns base64( iv + authTag + ciphertext )
 */
export function encryptAES256GCM(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/**
 * AES-256-GCM Decryption.
 * Expects base64( iv + authTag + ciphertext )
 */
export function decryptAES256GCM(ciphertextB64: string, key: Buffer): string {
  const buffer = Buffer.from(ciphertextB64, "base64");
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * X25519 Key Pair Generation (ECDH over Curve25519).
 */
export function generateX25519KeyPair(): { publicKey: Buffer; privateKey: Buffer } {
  const kp = crypto.generateKeyPairSync("x25519");
  const publicKey = kp.publicKey.export({ type: "spki", format: "der" });
  const privateKey = kp.privateKey.export({ type: "pkcs8", format: "der" });
  return { publicKey, privateKey };
}

/**
 * X25519 Shared Secret Computation.
 */
export function computeX25519SharedSecret(privateKey: Buffer, peerPublicKey: Buffer): Buffer {
  const ecdh = crypto.createECDH("x25519");
  ecdh.setPrivateKey(privateKey);
  return ecdh.computeSecret(peerPublicKey);
}

/**
 * Ed25519 Key Pair for Digital Signatures.
 */
export function generateEd25519KeyPair(): { publicKey: Buffer; privateKey: Buffer } {
  const kp = crypto.generateKeyPairSync("ed25519");
  const publicKey = kp.publicKey.export({ type: "spki", format: "der" });
  const privateKey = kp.privateKey.export({ type: "pkcs8", format: "der" });
  return { publicKey, privateKey };
}

/**
 * Ed25519 Sign a message.
 */
export function signEd25519(message: string, privateKey: Buffer): Buffer {
  const sign = crypto.createSign("SHA512");
  sign.update(message);
  return sign.sign(privateKey);
}

/**
 * Ed25519 Verify a signature.
 */
export function verifyEd25519(message: string, signature: Buffer, publicKey: Buffer): boolean {
  const verify = crypto.createVerify("SHA512");
  verify.update(message);
  return verify.verify(publicKey, signature);
}

/**
 * SHA-256 hash (hex).
 */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Secure message envelope for E2E encrypted transport.
 */
export function encryptMessage(plaintext: string, sharedKey: Buffer): { ciphertext: string; nonce: string } {
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("chacha20-poly1305", sharedKey, nonce);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([nonce, authTag, encrypted]).toString("base64"),
    nonce: nonce.toString("base64"),
  };
}

/**
 * Decrypt message envelope.
 */
export function decryptMessage(
  envelope: { ciphertext: string },
  sharedKey: Buffer
): string {
  const buffer = Buffer.from(envelope.ciphertext, "base64");
  const nonce = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv("chacha20-poly1305", sharedKey, nonce);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Generate a random encryption key.
 */
export function generateRandomKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Constant-time comparison to prevent timing attacks.
 */
export function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  return crypto.timingSafeEqual(a, b);
}
