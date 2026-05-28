// ── User ────────────────────────────────────────────────────
export interface TEXAUser {
  id: string;
  phone: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio: string;
  lastSeen: Date;
  online: boolean;
  verified: boolean;
}

// ── Chat ────────────────────────────────────────────────────
export interface Chat {
  id: string;
  type: "private" | "group" | "channel" | "secret";
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  participants: TEXAUser[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Message ─────────────────────────────────────────────────
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  type: "text" | "image" | "video" | "audio" | "document" | "voice" | "sticker";
  content: string;
  mediaUrl?: string;
  encrypted: boolean;
  reactions: MessageReaction[];
  replyTo?: string;
  edited: boolean;
  deleted: boolean;
  disappearingAt?: Date;
  readBy: string[];
  deliveredTo: string[];
  createdAt: Date;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
}

// ── Call ────────────────────────────────────────────────────
export interface Call {
  id: string;
  type: "voice" | "video";
  caller: TEXAUser;
  participants: TEXAUser[];
  status: "ringing" | "ongoing" | "ended" | "missed";
  direction: "incoming" | "outgoing";
  duration: number;
  encrypted: boolean;
  createdAt: Date;
}

// ── Status / Story ──────────────────────────────────────────
export interface Status {
  id: string;
  userId: string;
  user: TEXAUser;
  type: "text" | "image" | "video";
  content: string;
  mediaUrl?: string;
  backgroundColor?: string;
  views: string[];
  expiresAt: Date;
  createdAt: Date;
}

// ── Auth ────────────────────────────────────────────────────
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: TEXAUser | null;
  token: string | null;
}
