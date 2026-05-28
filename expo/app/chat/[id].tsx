import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Smile, Mic, Paperclip } from "lucide-react-native";
import TEXAColors from "@/constants/colors";
import { getChat, getMessages, getUser } from "@/data/mock";
import type { Message } from "@/types";

function formatMsgTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}) {
  const sender = getUser(message.senderId);
  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      {/* Avatar (received only) */}
      {!isOwn && (
        <View style={styles.bubbleAvatar}>
          {showAvatar && (
            <View style={styles.miniAvatar}>
              <Text style={styles.miniAvatarText}>
                {sender?.displayName?.charAt(0) ?? "?"}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Bubble */}
      <View style={[styles.bubbleWrapper, isOwn && styles.bubbleWrapperOwn]}>
        {!isOwn && showAvatar && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <View
          style={[
            styles.bubble,
            isOwn ? styles.bubbleOwn : styles.bubbleReceived,
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              isOwn ? styles.bubbleTextOwn : styles.bubbleTextReceived,
            ]}
          >
            {message.content}
          </Text>
          <View style={styles.bubbleMeta}>
            <Text
              style={[
                styles.bubbleTime,
                isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeReceived,
              ]}
            >
              {formatMsgTime(message.createdAt)}
              {isOwn && "  "}
              {isOwn && (
                <Text
                  style={[
                    styles.readCheck,
                    message.readBy.length > 0 && styles.readCheckSeen,
                  ]}
                >
                  {message.readBy.length > 0 ? "✓✓" : "✓"}
                </Text>
              )}
            </Text>
          </View>
        </View>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <View style={[styles.reactions, isOwn && styles.reactionsOwn]}>
            {message.reactions.map((r, i) => (
              <Text key={i} style={styles.reactionEmoji}>
                {r.emoji}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Avatar spacer (own) */}
      {isOwn && <View style={styles.bubbleAvatar} />}
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chat = getChat(id ?? "");
  const messages = getMessages(id ?? "");
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const otherParticipant = chat?.type === "private" ? chat.participants[1] : null;
  const headerName = chat?.type === "private" ? otherParticipant?.displayName : chat?.name;
  const headerOnline = otherParticipant?.online;

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [messages]
  );

  const handleSend = () => {
    if (!inputText.trim()) return;
    // In production: encrypt and send via WebSocket
    setInputText("");
  };

  if (!chat) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Chat not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={TEXAColors.textInverse} />
        </TouchableOpacity>

        {/* Contact info */}
        <TouchableOpacity style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {headerName?.charAt(0) ?? "?"}
            </Text>
          </View>
          <View>
            <Text style={styles.headerName}>{headerName}</Text>
            <Text style={styles.headerStatus}>
              {headerOnline ? "Online" : chat.type === "group" ? `${chat.participants.length} members` : "Last seen recently"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Phone size={20} color={TEXAColors.gold[400]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Video size={20} color={TEXAColors.gold[400]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={sortedMessages}
        keyExtractor={(item) => item.id}
        inverted
        renderItem={({ item, index }) => {
          const isOwn = item.senderId === "u1";
          const prevMsg = sortedMessages[index + 1];
          const showAvatar = !isOwn && prevMsg?.senderId !== item.senderId;
          return <MessageBubble message={item} isOwn={isOwn} showAvatar={showAvatar} />;
        }}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {/* Encryption notice */}
      <View style={styles.encryptionNotice}>
        <Text style={styles.encryptionText}>
          🔒 Messages are end-to-end encrypted
        </Text>
      </View>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.inputAction}>
          <Smile size={22} color={TEXAColors.dark[500]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inputAction}>
          <Paperclip size={22} color={TEXAColors.dark[500]} />
        </TouchableOpacity>
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Message..."
            placeholderTextColor={TEXAColors.dark[500]}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={5000}
            cursorColor={TEXAColors.gold[400]}
          />
        </View>
        {inputText.trim() ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Send size={20} color={TEXAColors.bgDark} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.inputAction}>
            <Mic size={22} color={TEXAColors.dark[500]} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEXAColors.bgDark,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: TEXAColors.dark[700],
    fontSize: 16,
  },
  // ── Header ─────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderBottomWidth: 0.5,
    borderBottomColor: TEXAColors.dark[200],
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXAColors.bgDark,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXAColors.textInverse,
  },
  headerStatus: {
    fontSize: 12,
    color: TEXAColors.dark[600],
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 4,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEXAColors.dark[100],
  },
  // ── Messages ──────────────────────────────────────────
  messageList: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-end",
  },
  bubbleRowOwn: {
    justifyContent: "flex-end",
  },
  bubbleAvatar: {
    width: 32,
    marginBottom: 2,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXAColors.bgDark,
  },
  bubbleWrapper: {
    maxWidth: "75%",
  },
  bubbleWrapperOwn: {
    alignItems: "flex-end",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXAColors.gold[400],
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  bubbleOwn: {
    backgroundColor: TEXAColors.gold[400],
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  bubbleReceived: {
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderWidth: 0.5,
    borderColor: TEXAColors.dark[200],
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextOwn: {
    color: TEXAColors.bgDark,
  },
  bubbleTextReceived: {
    color: TEXAColors.textInverse,
  },
  bubbleMeta: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  bubbleTime: {
    fontSize: 11,
  },
  bubbleTimeOwn: {
    color: TEXAColors.dark[100],
  },
  bubbleTimeReceived: {
    color: TEXAColors.dark[600],
  },
  readCheck: {
    fontSize: 10,
    color: TEXAColors.dark[200],
    letterSpacing: -1,
  },
  readCheckSeen: {
    color: TEXAColors.bgDark,
  },
  reactions: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  reactionsOwn: {
    justifyContent: "flex-end",
  },
  reactionEmoji: {
    fontSize: 13,
  },
  // ── Encryption notice ─────────────────────────────────
  encryptionNotice: {
    alignItems: "center",
    paddingVertical: 6,
    backgroundColor: TEXAColors.dark[50],
  },
  encryptionText: {
    fontSize: 11,
    color: TEXAColors.dark[500],
    fontWeight: "500",
  },
  // ── Input bar ─────────────────────────────────────────
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 28,
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderTopWidth: 0.5,
    borderTopColor: TEXAColors.dark[200],
    gap: 6,
  },
  inputAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: TEXAColors.dark[100],
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    maxHeight: 120,
    borderWidth: 0.5,
    borderColor: TEXAColors.dark[200],
  },
  textInput: {
    fontSize: 15,
    color: TEXAColors.textInverse,
    maxHeight: 100,
    padding: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
  },
});
