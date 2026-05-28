import sodium from "libsodium-wrappers";
import { v4 as uuidv4 } from "uuid";

export interface TexaSession {
  sessionId: string;
  sessionKey: string;
  nonce: string;
  createdAt: string;
  expiresAt: string;
}

export async function createSession(): Promise<TexaSession> {
  await sodium.ready;

  const sessionKey = sodium.randombytes_buf(
    sodium.crypto_secretbox_KEYBYTES
  );

  const nonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );

  const now = new Date();

  const expires = new Date(
    now.getTime() + 1000 * 60 * 60
  );

  return {
    sessionId: uuidv4(),

    sessionKey: sodium.to_base64(
      sessionKey,
      sodium.base64_variants.ORIGINAL
    ),

    nonce: sodium.to_base64(
      nonce,
      sodium.base64_variants.ORIGINAL
    ),

    createdAt: now.toISOString(),

    expiresAt: expires.toISOString(),
  };
}
