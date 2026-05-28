import sodium from "libsodium-wrappers";

export interface EncryptedMessage {
  ciphertext: string;
  nonce: string;
}

export async function encryptMessage(
  message: string,
  sessionKey: string
): Promise<EncryptedMessage> {
  await sodium.ready;

  const nonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );

  const encrypted = sodium.crypto_secretbox_easy(
    message,
    nonce,
    sodium.from_base64(sessionKey)
  );

  return {
    ciphertext: sodium.to_base64(
      encrypted,
      sodium.base64_variants.ORIGINAL
    ),

    nonce: sodium.to_base64(
      nonce,
      sodium.base64_variants.ORIGINAL
    ),
  };
}
