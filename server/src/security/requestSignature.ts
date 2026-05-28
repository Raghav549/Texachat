import sodium from "libsodium-wrappers";

export async function verifyRequestSignature(
  payload: string,
  signature: string,
  publicKey: string
) {
  await sodium.ready;

  return sodium.crypto_sign_verify_detached(
    sodium.from_base64(signature),
    payload,
    sodium.from_base64(publicKey)
  );
}
