import { createSession } from "./createSession";

export async function rotateSession() {
  return await createSession();
}
