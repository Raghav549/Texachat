import { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { Plus, Eye, Clock } from "lucide-react-native";
import TEXAColors from "@/constants/colors";
import { mockStatuses, getUser } from "@/data/mock";
import type { Status as StatusType } from "@/types";

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours === 1) return "1h ago";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatusRow({ status, index }: { status: StatusType; index: number }) {
  const user = status.user;
  const hasUnseen = status.views.length === 0;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(500).springify()}
    >
      <TouchableOpacity style={styles.statusRow} activeOpacity={0.7}>
        {/* Avatar ring */}
        <View style={[styles.avatarRing, hasUnseen && styles.avatarRingUnseen]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.displayName?.charAt(0) ?? "?"}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.statusInfo}>
          <Text style={styles.statusName}>{user.displayName}</Text>
          <Text style={styles.statusTime}>{timeAgo(status.createdAt)}</Text>
        </View>

        {/* Preview card */}
        <View style={[styles.statusPreview, { backgroundColor: status.backgroundColor ?? TEXAColors.bgDarkSecondary }]}>
          <Text style={styles.statusContent} numberOfLines={2}>
            {status.content}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function StatusScreen() {
  const recentStatuses = useMemo(
    () => [...mockStatuses].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    []
  );

  const viewedStatuses = recentStatuses.filter((s) => s.views.length > 0);
  const unseenStatuses = recentStatuses.filter((s) => s.views.length === 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Status</Text>
          <Text style={styles.headerSubtitle}>See what your contacts are up to</Text>
        </View>
        <TouchableOpacity style={styles.addStatusButton}>
          <Plus size={20} color={TEXAColors.gold[400]} />
        </TouchableOpacity>
      </View>

      {/* My Status */}
      <Animated.View entering={FadeInDown.duration(500).springify()}>
        <TouchableOpacity style={styles.myStatus} activeOpacity={0.8}>
          <View style={styles.myStatusAvatar}>
            <Text style={styles.myStatusAvatarText}>A</Text>
            <View style={styles.addCircle}>
              <Plus size={13} color={TEXAColors.bgDark} />
            </View>
          </View>
          <View style={styles.myStatusInfo}>
            <Text style={styles.myStatusTitle}>My Status</Text>
            <Text style={styles.myStatusHint}>Tap to add a status update</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Status list */}
      <FlatList
        data={recentStatuses}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <StatusRow status={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {unseenStatuses.length > 0 && (
              <Text style={styles.sectionHeader}>Recent updates</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCircle}>
              <Clock size={28} color={TEXAColors.dark[400]} />
            </View>
            <Text style={styles.emptyTitle}>No status updates</Text>
            <Text style={styles.emptySubtitle}>
              Status updates from your contacts will appear here
            </Text>
          </View>
        }
      />
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
    color: TEXAColors.textInverse,
  },
  headerSubtitle: {
    fontSize: 13,
    color: TEXAColors.dark[600],
    marginTop: 2,
  },
  addStatusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEXAColors.bgDarkSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: TEXAColors.dark[200],
  },
  // ── My Status ────────────────────────────────────────
  myStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 14,
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TEXAColors.dark[200],
  },
  myStatusAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  myStatusAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXAColors.bgDark,
  },
  addCircle: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: TEXAColors.gold[200],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: TEXAColors.bgDark,
  },
  myStatusInfo: {
    flex: 1,
  },
  myStatusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXAColors.textInverse,
  },
  myStatusHint: {
    fontSize: 13,
    color: TEXAColors.dark[500],
    marginTop: 2,
  },
  // ── Status Row ───────────────────────────────────────
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXAColors.gold[400],
    letterSpacing: 2,
    textTransform: "uppercase",
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 80,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.5,
    borderColor: TEXAColors.dark[300],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarRingUnseen: {
    borderColor: TEXAColors.gold[400],
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEXAColors.dark[100],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXAColors.textInverse,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXAColors.textInverse,
    marginBottom: 2,
  },
  statusTime: {
    fontSize: 13,
    color: TEXAColors.dark[600],
  },
  statusPreview: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: 160,
  },
  statusContent: {
    fontSize: 12,
    color: TEXAColors.textInverse,
    fontWeight: "500",
  },
  // ── Empty ────────────────────────────────────────────
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TEXAColors.bgDarkSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXAColors.textInverse,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXAColors.dark[600],
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
