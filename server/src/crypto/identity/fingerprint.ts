import crypto from "crypto";

export function generateFingerprint(
  publicKey: string
): string {
  return crypto
    .createHash("sha256")
    .update(publicKey)
    .digest("hex")
    .match(/.{1,4}/g)
    ?.join("-") || "";
}
