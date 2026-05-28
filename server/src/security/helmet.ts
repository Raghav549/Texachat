import helmet from "helmet";
import { Express } from "express";

export function configureHelmet(app: Express) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: "deny",
      },
      noSniff: true,
      referrerPolicy: {
        policy: "no-referrer",
      },
    })
  );
}
