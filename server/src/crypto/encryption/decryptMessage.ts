import sodium from "libsodium-wrappers";

export async function decryptMessage(
  ciphertext: string,
  nonce: string,
  sessionKey: string
): Promise<string> {
  await sodium.ready;

  const decrypted =
    sodium.crypto_secretbox_open_easy(
      sodium.from_base64(ciphertext),
      sodium.from_base64(nonce),
      sodium.from_base64(sessionKey)
    );

  return sodium.to_string(decrypted);
}
