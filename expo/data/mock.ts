import type { Chat, TEXAUser, Message, Call, Status, MessageReaction } from "@/types";

export const mockUsers: TEXAUser[] = [
  {
    id: "u1", phone: "+15551234567", username: "alexchen", displayName: "Alex Chen",
    bio: "Product designer at TEXA", lastSeen: new Date(), online: true, verified: true,
  },
  {
    id: "u2", phone: "+15559876543", username: "sarahk", displayName: "Sarah Kim",
    bio: "Building the future", lastSeen: new Date(Date.now() - 300000), online: true, verified: true,
  },
  {
    id: "u3", phone: "+15551112222", username: "marcusr", displayName: "Marcus Rivera",
    bio: "Engineer & traveler", lastSeen: new Date(Date.now() - 900000), online: false, verified: true,
  },
  {
    id: "u4", phone: "+15553334444", username: "emilyz", displayName: "Emily Zhang",
    bio: "Photographer", lastSeen: new Date(Date.now() - 1800000), online: false, verified: false,
  },
  {
    id: "u5", phone: "+15555556666", username: "davidl", displayName: "David Lee",
    bio: "Startup founder", lastSeen: new Date(Date.now() - 60000), online: true, verified: true,
  },
  {
    id: "u6", phone: "+15557778888", username: "oliviap", displayName: "Olivia Park",
    bio: "Music producer", lastSeen: new Date(Date.now() - 7200000), online: false, verified: false,
  },
];

const mockMessages: Record<string, Message[]> = {
  "chat_1": [
    { id: "m1", chatId: "chat_1", senderId: "u2", senderName: "Sarah Kim", type: "text", content: "Hey Alex! Did you see the latest design updates? 🎨", encrypted: true, reactions: [], readBy: ["u1"], deliveredTo: ["u1"], edited: false, deleted: false, createdAt: new Date(Date.now() - 3600000) },
    { id: "m2", chatId: "chat_1", senderId: "u1", senderName: "Alex Chen", type: "text", content: "Yes! The new glassmorphism components look incredible. I think we should use them for the chat bubbles too", encrypted: true, reactions: [], readBy: ["u2"], deliveredTo: ["u2"], edited: false, deleted: false, createdAt: new Date(Date.now() - 3500000) },
    { id: "m3", chatId: "chat_1", senderId: "u2", senderName: "Sarah Kim", type: "text", content: "Great idea! Let me mock that up real quick. I'm thinking soft golden gradients with the white overlay", encrypted: true, reactions: [{ userId: "u1", emoji: "🔥" }], readBy: ["u1"], deliveredTo: ["u1"], edited: false, deleted: false, createdAt: new Date(Date.now() - 3400000) },
    { id: "m4", chatId: "chat_1", senderId: "u2", senderName: "Sarah Kim", type: "text", content: "Also, what do you think about adding a subtle pulse animation when messages arrive?", encrypted: true, reactions: [], readBy: ["u1"], deliveredTo: ["u1"], edited: false, deleted: false, createdAt: new Date(Date.now() - 3300000) },
    { id: "m5", chatId: "chat_1", senderId: "u1", senderName: "Alex Chen", type: "text", content: "Love that! Let's keep it subtle though — we don't want to distract from the content. Maybe a gentle gold shimmer effect?", encrypted: true, reactions: [{ userId: "u2", emoji: "✨" }], readBy: ["u2"], deliveredTo: ["u2"], edited: true, deleted: false, createdAt: new Date(Date.now() - 3200000) },
    { id: "m6", chatId: "chat_1", senderId: "u2", senderName: "Sarah Kim", type: "text", content: "Perfect. I'll have designs ready by EOD. The TEXA design system is really coming together! 🚀", encrypted: true, reactions: [{ userId: "u1", emoji: "💛" }], readBy: ["u1"], deliveredTo: ["u1"], edited: false, deleted: false, createdAt: new Date(Date.now() - 600000) },
    { id: "m7", chatId: "chat_1", senderId: "u1", senderName: "Alex Chen", type: "text", content: "Can't wait to see it! This is going to be the best looking messaging app on the market", encrypted: true, reactions: [], readBy: [], deliveredTo: ["u2"], edited: false, deleted: false, createdAt: new Date(Date.now() - 300000) },
    { id: "m8", chatId: "chat_1", senderId: "u2", senderName: "Sarah Kim", type: "text", content: "Absolutely. Connect beyond limits! 💫", encrypted: true, reactions: [], readBy: [], deliveredTo: [], edited: false, deleted: false, createdAt: new Date(Date.now() - 60000) },
  ],
  "chat_2": [
    { id: "m9", chatId: "chat_2", senderId: "u3", senderName: "Marcus Rivera", type: "text", content: "Team, the encryption audit passed all tests today 🎉", encrypted: true, reactions: [{ userId: "u4", emoji: "🎉" }], readBy: ["u1", "u4", "u5"], deliveredTo: ["u1", "u4", "u5"], edited: false, deleted: false, createdAt: new Date(Date.now() - 7200000) },
    { id: "m10", chatId: "chat_2", senderId: "u5", senderName: "David Lee", type: "text", content: "Amazing work! The Signal protocol implementation is solid", encrypted: true, reactions: [], readBy: ["u1"], deliveredTo: ["u1"], edited: false, deleted: false, createdAt: new Date(Date.now() - 7100000) },
    { id: "m11", chatId: "chat_2", senderId: "u4", senderName: "Emily Zhang", type: "text", content: "When can we ship the beta? I have testers lined up", encrypted: true, reactions: [], readBy: ["u1"], deliveredTo: ["u1"], edited: false, deleted: false, createdAt: new Date(Date.now() - 3000000) },
  ],
  "chat_3": [
    { id: "m12", chatId: "chat_3", senderId: "u5", senderName: "David Lee", type: "text", content: "Hey, are you coming to the startup mixer tonight?", encrypted: true, reactions: [], readBy: ["u1"], deliveredTo: ["u1"], edited: false, deleted: false, createdAt: new Date(Date.now() - 18000000) },
    { id: "m13", chatId: "chat_3", senderId: "u1", senderName: "Alex Chen", type: "text", content: "Wouldn't miss it! What time does it start?", encrypted: true, reactions: [], readBy: ["u5"], deliveredTo: ["u5"], edited: false, deleted: false, createdAt: new Date(Date.now() - 17900000) },
    { id: "m14", chatId: "chat_3", senderId: "u5", senderName: "David Lee", type: "text", content: "7pm at The Hive. I'll send you the address", encrypted: true, reactions: [], readBy: ["u1"], deliveredTo: ["u1"], edited: false, deleted: false, createdAt: new Date(Date.now() - 17800000) },
  ],
};

export const mockChats: Chat[] = [
  {
    id: "chat_1", type: "private", name: undefined, avatar: undefined,
    lastMessage: mockMessages["chat_1"]?.[mockMessages["chat_1"].length - 1] ?? null,
    unreadCount: 1, pinned: true, muted: false, archived: false,
    participants: [mockUsers[0]!, mockUsers[1]!],
    createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 60000),
  },
  {
    id: "chat_2", type: "group", name: "TEXA Engineering", avatar: undefined,
    lastMessage: mockMessages["chat_2"]?.[mockMessages["chat_2"].length - 1] ?? null,
    unreadCount: 3, pinned: true, muted: false, archived: false,
    participants: [mockUsers[0]!, mockUsers[2]!, mockUsers[3]!, mockUsers[4]!],
    createdAt: new Date(Date.now() - 604800000), updatedAt: new Date(Date.now() - 3000000),
  },
  {
    id: "chat_3", type: "private", name: undefined, avatar: undefined,
    lastMessage: mockMessages["chat_3"]?.[mockMessages["chat_3"].length - 1] ?? null,
    unreadCount: 0, pinned: false, muted: false, archived: false,
    participants: [mockUsers[0]!, mockUsers[4]!],
    createdAt: new Date(Date.now() - 259200000), updatedAt: new Date(Date.now() - 17800000),
  },
  {
    id: "chat_4", type: "private", name: undefined, avatar: undefined,
    lastMessage: null,
    unreadCount: 0, pinned: false, muted: true, archived: false,
    participants: [mockUsers[0]!, mockUsers[5]!],
    createdAt: new Date(Date.now() - 1209600000), updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "chat_5", type: "channel", name: "TEXA Announcements", avatar: undefined,
    lastMessage: { id: "m15", chatId: "chat_5", senderId: "u1", senderName: "TEXA Team", type: "text", content: "🎉 TEXA Beta v1.0 is now live! Experience next-gen secure messaging.", encrypted: true, reactions: [], readBy: [], deliveredTo: [], edited: false, deleted: false, createdAt: new Date(Date.now() - 43200000) },
    unreadCount: 0, pinned: false, muted: false, archived: false,
    participants: [mockUsers[0]!],
    createdAt: new Date(Date.now() - 2592000000), updatedAt: new Date(Date.now() - 43200000),
  },
];

export const mockCalls: Call[] = [
  { id: "c1", type: "video", caller: mockUsers[1]!, participants: [mockUsers[1]!, mockUsers[0]!], status: "ended", direction: "incoming", duration: 1247, encrypted: true, createdAt: new Date(Date.now() - 7200000) },
  { id: "c2", type: "voice", caller: mockUsers[4]!, participants: [mockUsers[4]!, mockUsers[0]!], status: "missed", direction: "incoming", duration: 0, encrypted: true, createdAt: new Date(Date.now() - 18000000) },
  { id: "c3", type: "voice", caller: mockUsers[0]!, participants: [mockUsers[0]!, mockUsers[2]!], status: "ended", direction: "outgoing", duration: 423, encrypted: true, createdAt: new Date(Date.now() - 43200000) },
  { id: "c4", type: "video", caller: mockUsers[0]!, participants: [mockUsers[0]!, mockUsers[3]!], status: "ended", direction: "outgoing", duration: 892, encrypted: true, createdAt: new Date(Date.now() - 86400000) },
];

export const mockStatuses: Status[] = [
  { id: "s1", userId: "u2", user: mockUsers[1]!, type: "text", content: "Designing the future ✨", backgroundColor: "#1A1D2A", views: ["u1", "u3"], expiresAt: new Date(Date.now() + 79200000), createdAt: new Date(Date.now() - 7200000) },
  { id: "s2", userId: "u4", user: mockUsers[3]!, type: "text", content: "Golden hour shoot 📸", backgroundColor: "#D4A843", views: ["u1"], expiresAt: new Date(Date.now() + 64800000), createdAt: new Date(Date.now() - 21600000) },
  { id: "s3", userId: "u5", user: mockUsers[4]!, type: "text", content: "Building TEXA at 2am 💻", backgroundColor: "#0D0F17", views: [], expiresAt: new Date(Date.now() + 54000000), createdAt: new Date(Date.now() - 32400000) },
  { id: "s4", userId: "u3", user: mockUsers[2]!, type: "text", content: "Weekend vibes 🌊", backgroundColor: "#3B82F6", views: ["u1", "u2"], expiresAt: new Date(Date.now() + 43200000), createdAt: new Date(Date.now() - 43200000) },
];

export const getMessages = (chatId: string): Message[] => mockMessages[chatId] ?? [];
export const getChat = (chatId: string): Chat | undefined => mockChats.find((c) => c.id === chatId);
export const getUser = (userId: string): TEXAUser | undefined => mockUsers.find((u) => u.id === userId);
