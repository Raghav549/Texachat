import express from "express";
import cors from "cors";
import { createServer } from "http";
import { config } from "./config";
import { initSocketIO } from "./services/socket";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chats";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
const httpServer = createServer(app);

// ── Middleware ─────────────────────────────────────────────────
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "TEXA Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
});

// ── API Routes ────────────────────────────────────────────────
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);
app.use("/api", authRoutes);
app.use("/api", chatRoutes);

// ── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Initialize Socket.IO ──────────────────────────────────────
const io = initSocketIO(httpServer);

// ── Start Server ──────────────────────────────────────────────
httpServer.listen(config.port, () => {
  console.log(`╔════════════════════════════════════════════╗`);
  console.log(`║         TEXA SERVER v1.0.0                ║`);
  console.log(`║         Connect Beyond Limits              ║`);
  console.log(`╠════════════════════════════════════════════╣`);
  console.log(`║  HTTP:      http://localhost:${config.port}       ║`);
  console.log(`║  Socket.IO: ws://localhost:${config.port}         ║`);
  console.log(`║  Environment: ${config.nodeEnv}                    ║`);
  console.log(`╚════════════════════════════════════════════╝`);
});

export { app, httpServer, io };
