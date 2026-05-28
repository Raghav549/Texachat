import sodium from "libsodium-wrappers";

export async function verifyIdentity(
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> {
  await sodium.ready;

  return sodium.crypto_sign_verify_detached(
    sodium.from_base64(signature),
    message,
    sodium.from_base64(publicKey)
  );
}
