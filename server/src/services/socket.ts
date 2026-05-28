import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { AuthPayload } from "../middleware/auth";

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
  userId?: string;
  sessionId?: string;
}

let io: Server;

/**
 * Initialize Socket.IO server with authentication.
 */
export function initSocketIO(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token as string, config.jwt.secret) as AuthPayload;
      socket.userId = decoded.userId;
      socket.sessionId = decoded.sessionId;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`[Socket] User connected: ${userId}`);

    // Join personal room for direct messaging
    socket.join(`user:${userId}`);

    // Update online status
    await prisma.user.update({
      where: { id: userId },
      data: { online: true, lastSeen: new Date() },
    });

    // Broadcast online status to friends
    socket.broadcast.emit("presence:online", { userId, online: true });

    // Handle joining chat rooms
    socket.on("chat:join", async (chatId: string) => {
      socket.join(`chat:${chatId}`);
      console.log(`[Socket] User ${userId} joined chat ${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on("chat:leave", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    // Handle new message
    socket.on("message:send", async (data: {
      chatId: string;
      type: string;
      content: string;
      mediaUrl?: string;
      mediaEncryptedKey?: string;
      replyToId?: string;
    }) => {
      try {
        const message = await prisma.message.create({
          data: {
            chatId: data.chatId,
            senderId: userId,
            type: data.type,
            content: data.content,
            mediaUrl: data.mediaUrl || null,
            mediaEncryptedKey: data.mediaEncryptedKey || null,
            replyToId: data.replyToId || null,
            deliveredTo: [userId],
          },
        });

        await prisma.chat.update({
          where: { id: data.chatId },
          data: { lastMessageAt: new Date(), updatedAt: new Date() },
        });

        // Broadcast to all members in the chat room (except sender)
        socket.to(`chat:${data.chatId}`).emit("message:new", {
          message,
          chatId: data.chatId,
        });

        // Confirm delivery to sender
        socket.emit("message:sent", { message, tempId: data.chatId });
      } catch (err) {
        console.error("[Socket] Message send error:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing:start", (chatId: string) => {
      socket.to(`chat:${chatId}`).emit("typing:update", { userId, chatId, typing: true });
    });

    socket.on("typing:stop", (chatId: string) => {
      socket.to(`chat:${chatId}`).emit("typing:update", { userId, chatId, typing: false });
    });

    // Mark messages as read
    socket.on("message:read", async (data: { chatId: string; messageIds: string[] }) => {
      try {
        await prisma.message.updateMany({
          where: {
            id: { in: data.messageIds },
            chatId: data.chatId,
            senderId: { not: userId },
          },
          data: {
            readBy: { push: userId },
          },
        });

        socket.to(`chat:${data.chatId}`).emit("message:read-receipt", {
          userId,
          chatId: data.chatId,
          messageIds: data.messageIds,
        });
      } catch (err) {
        console.error("[Socket] Read receipt error:", err);
      }
    });

    // WebRTC signaling
    socket.on("call:offer", (data: { chatId: string; offer: any; callType: string }) => {
      socket.to(`chat:${data.chatId}`).emit("call:incoming", {
        callerId: userId,
        callType: data.callType,
        offer: data.offer,
      });
    });

    socket.on("call:answer", (data: { chatId: string; answer: any }) => {
      socket.to(`chat:${data.chatId}`).emit("call:answered", {
        userId,
        answer: data.answer,
      });
    });

    socket.on("call:ice-candidate", (data: { chatId: string; candidate: any }) => {
      socket.to(`chat:${data.chatId}`).emit("call:ice-candidate", {
        userId,
        candidate: data.candidate,
      });
    });

    socket.on("call:end", (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit("call:ended", { userId });
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log(`[Socket] User disconnected: ${userId}`);

      await prisma.user.update({
        where: { id: userId },
        data: { online: false, lastSeen: new Date() },
      });

      socket.broadcast.emit("presence:offline", { userId, online: false });
    });
  });

  return io;
}

/**
 * Get the Socket.IO instance.
 */
export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
