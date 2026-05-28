import { encryptMessage } from "./encryptMessage";

export async function encryptGroupMessage(
  message: string,
  groupSessionKey: string
) {
  return await encryptMessage(
    message,
    groupSessionKey
  );
}
