const revokedSessions = new Set<string>();

export function revokeSession(
  sessionId: string
) {
  revokedSessions.add(sessionId);
}

export function isSessionRevoked(
  sessionId: string
) {
  return revokedSessions.has(sessionId);
}
