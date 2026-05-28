const usedNonces = new Set<string>();

export function validateNonce(nonce: string) {
  if (usedNonces.has(nonce)) {
    return false;
  }

  usedNonces.add(nonce);

  setTimeout(() => {
    usedNonces.delete(nonce);
  }, 5 * 60 * 1000);

  return true;
}
