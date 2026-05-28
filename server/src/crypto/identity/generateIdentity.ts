import sodium from "libsodium-wrappers";
import { v4 as uuidv4 } from "uuid";

export interface TexaIdentity {
  id: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
}

export async function generateIdentity(): Promise<TexaIdentity> {
  await sodium.ready;

  const keyPair = sodium.crypto_box_keypair();

  return {
    id: uuidv4(),

    publicKey: sodium.to_base64(
      keyPair.publicKey,
      sodium.base64_variants.ORIGINAL
    ),

    privateKey: sodium.to_base64(
      keyPair.privateKey,
      sodium.base64_variants.ORIGINAL
    ),

    createdAt: new Date().toISOString(),
  };
}
