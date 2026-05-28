import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  SlideInRight,
} from "react-native-reanimated";
import { MessageCircle, Pin, Search, Users, Volume2, VolumeX, ChevronRight } from "lucide-react-native";
import TEXAColors from "@/constants/colors";
import { mockChats } from "@/data/mock";
import type { Chat } from "@/types";

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 86400000) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 604800000) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ChatRow({ chat, index }: { chat: Chat; index: number }) {
  const isGroup = chat.type === "group" || chat.type === "channel";
  const displayName = isGroup ? chat.name : chat.participants[1]?.displayName ?? "Unknown";
  const displayAvatar = chat.name?.charAt(0) ?? chat.participants[1]?.displayName?.charAt(0) ?? "?";

  const lastMsgPreview = chat.lastMessage
    ? chat.lastMessage.type === "text"
      ? chat.lastMessage.content
      : `📎 ${chat.lastMessage.type}`
    : "No messages yet";

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).duration(500).springify()}
    >
      <Pressable
        style={({ pressed }) => [
          styles.chatRow,
          pressed && styles.chatRowPressed,
        ]}
        onPress={() => router.push(`/chat/${chat.id}`)}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayAvatar}</Text>
          {chat.participants[1]?.online && <View style={styles.onlineDot} />}
        </View>

        {/* Content */}
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <View style={styles.chatNameRow}>
              {chat.pinned && <Pin size={12} color={TEXAColors.gold[400]} style={styles.pinIcon} />}
              <Text style={styles.chatName} numberOfLines={1}>
                {displayName}
              </Text>
              {chat.verified !== false && isGroup && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            {chat.lastMessage && (
              <Text style={styles.chatTime}>
                {formatTime(chat.lastMessage.createdAt)}
              </Text>
            )}
          </View>

          <View style={styles.chatFooter}>
            <View style={styles.messagePreview}>
              {chat.muted && <VolumeX size={12} color={TEXAColors.dark[500]} style={styles.muteIcon} />}
              <Text
                style={[
                  styles.lastMessage,
                  chat.unreadCount > 0 && styles.lastMessageUnread,
                ]}
                numberOfLines={1}
              >
                {lastMsgPreview}
              </Text>
            </View>

            {chat.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                </Text>
              </View>
            ) : (
              chat.lastMessage && (
                <View style={styles.readReceipt}>
                  <Text style={styles.readCheck}>✓✓</Text>
                </View>
              )
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCircle}>
        <MessageCircle size={32} color={TEXAColors.dark[400]} />
      </View>
      <Text style={styles.emptyTitle}>No chats yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a conversation and connect beyond limits
      </Text>
    </View>
  );
}

export default function ChatsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return mockChats;
    const q = searchQuery.toLowerCase();
    return mockChats.filter((c) => {
      const name = c.type === "private" ? c.participants[1]?.displayName : c.name;
      return name?.toLowerCase().includes(q);
    });
  }, [searchQuery]);

  const pinnedChats = filteredChats.filter((c) => c.pinned);
  const otherChats = filteredChats.filter((c) => !c.pinned);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TEXA</Text>
          <Text style={styles.headerSubtitle}>Connect Beyond Limits</Text>
        </View>
        <TouchableOpacity style={styles.newChatButton}>
          <MessageCircle size={20} color={TEXAColors.gold[400]} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color={TEXAColors.dark[500]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor={TEXAColors.dark[500]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          cursorColor={TEXAColors.gold[400]}
        />
      </View>

      {/* Chat list */}
      {filteredChats.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <ChatRow chat={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            pinnedChats.length > 0 ? (
              <Text style={styles.sectionHeader}>Pinned</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEXAColors.bgDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: TEXAColors.gold[400],
    letterSpacing: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: TEXAColors.dark[600],
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 2,
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEXAColors.bgDarkSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: TEXAColors.dark[200],
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TEXAColors.dark[200],
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXAColors.textInverse,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXAColors.gold[400],
    letterSpacing: 2,
    textTransform: "uppercase",
    paddingHorizontal: 24,
    marginBottom: 8,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  chatRowPressed: {
    backgroundColor: TEXAColors.dark[50],
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXAColors.bgDark,
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: TEXAColors.online,
    borderWidth: 2.5,
    borderColor: TEXAColors.bgDark,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pinIcon: {
    marginRight: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXAColors.textInverse,
    flexShrink: 1,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: "800",
    color: TEXAColors.bgDark,
  },
  chatTime: {
    fontSize: 12,
    color: TEXAColors.dark[600],
    marginLeft: 8,
  },
  chatFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  muteIcon: {
    marginRight: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: TEXAColors.dark[600],
    flex: 1,
  },
  lastMessageUnread: {
    color: TEXAColors.textInverse,
    fontWeight: "500",
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXAColors.bgDark,
  },
  readReceipt: {
    marginLeft: 8,
  },
  readCheck: {
    fontSize: 11,
    color: TEXAColors.gold[400],
    letterSpacing: -1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: TEXAColors.bgDarkSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXAColors.textInverse,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXAColors.dark[600],
    textAlign: "center",
    lineHeight: 20,
  },
});
