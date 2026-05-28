import { decryptMessage } from "./decryptMessage";

export async function decryptGroupMessage(
  ciphertext: string,
  nonce: string,
  groupSessionKey: string
) {
  return await decryptMessage(
    ciphertext,
    nonce,
    groupSessionKey
  );
}
