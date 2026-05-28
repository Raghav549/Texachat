import { Request } from "express";

export function validateSession(req: Request) {
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;

  return {
    valid: true,
    fingerprint: `${userAgent}:${ip}`,
  };
}
