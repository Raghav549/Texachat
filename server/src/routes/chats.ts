import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /chats
 * Get all chats for authenticated user.
 */
router.get("/chats", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const chatMembers = await prisma.chatMember.findMany({
      where: { userId: req.user.userId },
      include: {
        chat: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true, username: true, displayName: true,
                    avatarUrl: true, online: true, lastSeen: true, verified: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: {
                id: true, content: true, type: true, createdAt: true,
                senderId: true, readBy: true, deliveredTo: true,
              },
            },
          },
        },
      },
    });

    const chats = chatMembers.map((cm) => ({
      id: cm.chat.id,
      type: cm.chat.type,
      name: cm.chat.name,
      avatarUrl: cm.chat.avatarUrl,
      lastMessage: cm.chat.messages[0] || null,
      unreadCount: cm.chat.messages.filter(
        (m) => m.senderId !== req.user!.userId && !m.readBy.includes(req.user!.userId)
      ).length,
      pinned: cm.chat.pinned,
      muted: cm.chat.muted,
      archived: cm.chat.archived,
      participants: cm.chat.members.map((m) => m.user),
      updatedAt: cm.chat.updatedAt,
      createdAt: cm.chat.createdAt,
    }));

    res.json({ chats });
  } catch (error: any) {
    console.error("[Chats] List error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /chats
 * Create a new chat (private or group).
 */
router.post("/chats", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { type, name, participantIds } = req.body;
    if (!type || !participantIds || !Array.isArray(participantIds)) {
      res.status(400).json({ error: "Chat type and participant IDs are required" });
      return;
    }

    const chat = await prisma.chat.create({
      data: {
        type,
        name: name || null,
        members: {
          create: [
            { userId: req.user.userId, role: type === "group" ? "owner" : "member" },
            ...participantIds.map((pid: string) => ({
              userId: pid,
              role: "member",
            })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true, username: true, displayName: true,
                avatarUrl: true, online: true, lastSeen: true, verified: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      chat: {
        id: chat.id,
        type: chat.type,
        name: chat.name,
        avatarUrl: chat.avatarUrl,
        participants: chat.members.map((m) => m.user),
        createdAt: chat.createdAt,
      },
    });
  } catch (error: any) {
    console.error("[Chats] Create error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /chats/:id/messages
 * Get messages for a specific chat (paginated).
 */
router.get("/chats/:id/messages", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { before, limit } = req.query;
    const take = Math.min(parseInt(limit as string) || 50, 100);

    // Verify user is a member
    const membership = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId: id, userId: req.user.userId } },
    });
    if (!membership) {
      res.status(403).json({ error: "You are not a member of this chat" });
      return;
    }

    const where: any = { chatId: id };
    if (before) {
      where.createdAt = { lt: new Date(before as string) };
    }

    const messages = await prisma.message.findMany({
      where,
      take,
      orderBy: { createdAt: "desc" },
    });

    res.json({ messages: messages.reverse() });
  } catch (error: any) {
    console.error("[Chats] Messages error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /chats/:id/messages
 * Send an encrypted message to a chat.
 */
router.post("/chats/:id/messages", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { type, content, mediaUrl, mediaEncryptedKey, replyToId, disappearingAt } = req.body;

    if (!type || !content) {
      res.status(400).json({ error: "Message type and content are required" });
      return;
    }

    // Verify membership
    const membership = await prisma.chatMember.findUnique({
      where: { chatId_userId: { chatId: id, userId: req.user.userId } },
    });
    if (!membership) {
      res.status(403).json({ error: "You are not a member of this chat" });
      return;
    }

    const message = await prisma.message.create({
      data: {
        chatId: id,
        senderId: req.user.userId,
        type,
        content,
        mediaUrl: mediaUrl || null,
        mediaEncryptedKey: mediaEncryptedKey || null,
        replyToId: replyToId || null,
        disappearingAt: disappearingAt ? new Date(disappearingAt) : null,
        deliveredTo: [req.user.userId],
      },
    });

    // Update chat last message timestamp
    await prisma.chat.update({
      where: { id },
      data: { lastMessageAt: new Date(), updatedAt: new Date() },
    });

    res.json({ success: true, message });
  } catch (error: any) {
    console.error("[Chats] Send message error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /chats/:id/read
 * Mark messages as read in a chat.
 */
router.post("/chats/:id/read", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { messageIds } = req.body;

    await prisma.message.updateMany({
      where: {
        chatId: id,
        id: { in: messageIds },
        senderId: { not: req.user.userId },
      },
      data: {
        readBy: { push: req.user.userId },
      },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Chats] Read error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /chats/:id/messages/:msgId
 * Delete (revoke) a message.
 */
router.delete("/chats/:id/messages/:msgId", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id, msgId } = req.params;

    const msg = await prisma.message.findFirst({
      where: { id: msgId, chatId: id, senderId: req.user.userId },
    });

    if (!msg) {
      res.status(404).json({ error: "Message not found or not yours" });
      return;
    }

    await prisma.message.update({
      where: { id: msgId },
      data: { deleted: true, content: "" },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Chats] Delete message error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
