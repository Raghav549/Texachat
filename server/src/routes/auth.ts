import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOTP, verifyOTP } from "../services/twilio";
import { generateToken, generateRefreshToken, authMiddleware } from "../middleware/auth";
import { generateEd25519KeyPair } from "../services/encryption";

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /auth/send-otp
 * Send verification code to phone number via Twilio Verify.
 */
router.post("/auth/send-otp", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ error: "Phone number is required" });
      return;
    }

    // Normalize phone number (ensure + prefix)
    const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    const result = await sendOTP(normalizedPhone);
    if (!result.success) {
      res.status(400).json({ error: result.error || "Failed to send verification code" });
      return;
    }

    res.json({
      success: true,
      message: "Verification code sent successfully",
      phone: normalizedPhone,
    });
  } catch (error: any) {
    console.error("[Auth] Send OTP error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/verify-otp
 * Verify OTP code and login/register user.
 */
router.post("/auth/verify-otp", async (req: Request, res: Response) => {
  try {
    const { phone, code, deviceInfo, deviceName } = req.body;
    if (!phone || !code) {
      res.status(400).json({ error: "Phone and code are required" });
      return;
    }

    const normalizedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    // Verify OTP with Twilio
    const result = await verifyOTP(normalizedPhone, code);
    if (!result.success) {
      res.status(400).json({ error: result.error || "Invalid verification code" });
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });

    if (!user) {
      // Generate identity keys for new user
      const identityKeys = generateEd25519KeyPair();

      // Generate username from phone
      const username = `texa_${crypto.randomBytes(4).toString("hex")}`;
      const displayName = `TEXA User`;

      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          username,
          displayName,
          verified: true,
          online: true,
          identityKeyPublic: identityKeys.publicKey.toString("base64"),
          identityKeyPrivate: identityKeys.privateKey.toString("base64"),
        },
      });
    } else {
      // Update online status
      await prisma.user.update({
        where: { id: user.id },
        data: { online: true, lastSeen: new Date(), verified: true },
      });
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const tokenPayload = { userId: user.id, phone: user.phone, sessionId };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token,
        refreshToken,
        deviceInfo: deviceInfo || "Unknown",
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Register device if provided
    if (deviceName) {
      await prisma.device.create({
        data: {
          userId: user.id,
          deviceName,
          deviceId: crypto.randomUUID(),
          trusted: true,
          lastActive: new Date(),
        },
      });
    }

    res.json({
      success: true,
      token,
      refreshToken,
      sessionId,
      user: {
        id: user.id,
        phone: user.phone,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        verified: user.verified,
        online: true,
        lastSeen: user.lastSeen.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[Auth] Verify OTP error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/logout
 * Invalidate session and set user offline.
 */
router.post("/auth/logout", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await prisma.session.deleteMany({
      where: { id: req.user.sessionId },
    });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { online: false, lastSeen: new Date() },
    });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    console.error("[Auth] Logout error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /auth/me
 * Get current authenticated user profile.
 */
router.get("/auth/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, phone: true, username: true, displayName: true,
        avatarUrl: true, bio: true, verified: true, online: true,
        lastSeen: true, twoFactorEnabled: true, biometricEnabled: true,
        hideOnline: true, hideReadReceipts: true, screenshotProtection: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    console.error("[Auth] Me error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /auth/devices
 * Get all devices for current user.
 */
router.get("/auth/devices", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const devices = await prisma.device.findMany({
      where: { userId: req.user.userId },
      orderBy: { lastActive: "desc" },
    });

    res.json({ devices });
  } catch (error: any) {
    console.error("[Auth] Devices error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /auth/devices/revoke
 * Revoke a specific device session.
 */
router.post("/auth/devices/revoke", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { deviceId } = req.body;
    await prisma.device.deleteMany({
      where: { id: deviceId, userId: req.user.userId },
    });

    res.json({ success: true, message: "Device revoked" });
  } catch (error: any) {
    console.error("[Auth] Revoke device error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /auth/profile
 * Update user profile.
 */
router.put("/auth/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { displayName, bio, avatarUrl, hideOnline, hideReadReceipts, screenshotProtection, twoFactorEnabled, biometricEnabled } = req.body;

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (hideOnline !== undefined) updateData.hideOnline = hideOnline;
    if (hideReadReceipts !== undefined) updateData.hideReadReceipts = hideReadReceipts;
    if (screenshotProtection !== undefined) updateData.screenshotProtection = screenshotProtection;
    if (twoFactorEnabled !== undefined) updateData.twoFactorEnabled = twoFactorEnabled;
    if (biometricEnabled !== undefined) updateData.biometricEnabled = biometricEnabled;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true, phone: true, username: true, displayName: true,
        avatarUrl: true, bio: true, verified: true, online: true,
        lastSeen: true, twoFactorEnabled: true, biometricEnabled: true,
        hideOnline: true, hideReadReceipts: true, screenshotProtection: true,
      },
    });

    res.json({ success: true, user });
  } catch (error: any) {
    console.error("[Auth] Profile update error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
