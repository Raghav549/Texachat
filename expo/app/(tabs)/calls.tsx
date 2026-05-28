/**
 * TEXA Calls Screen
 * Premium call history with golden accents.
 */
import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { Phone, Video, PhoneMissed, PhoneOutgoing, PhoneIncoming, Plus } from "lucide-react-native";
import TEXAColors from "@/constants/colors";
import { mockCalls, getUser } from "@/data/mock";
import type { Call } from "@/types";

function formatCallTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 86400000) return "Today";
  if (diff < 172800000) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function CallRow({ call, index }: { call: Call; index: number }) {
  const otherParty = call.direction === "outgoing" ? call.participants[1] : call.caller;
  const isMissed = call.status === "missed";
  const isIncoming = call.direction === "incoming";
  const isVideo = call.type === "video";

  const CallIcon = isMissed ? PhoneMissed : isIncoming ? PhoneIncoming : PhoneOutgoing;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 80).duration(500).springify()}
    >
      <TouchableOpacity style={styles.callRow} activeOpacity={0.7}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {otherParty?.displayName?.charAt(0) ?? "?"}
          </Text>
          <View style={[styles.callTypeBadge, isVideo && styles.callTypeVideo]}>
            {isVideo ? (
              <Video size={10} color={TEXAColors.bgDark} />
            ) : (
              <Phone size={10} color={TEXAColors.bgDark} />
            )}
          </View>
        </View>

        {/* Info */}
        <View style={styles.callInfo}>
          <Text style={styles.callName}>{otherParty?.displayName ?? "Unknown"}</Text>
          <View style={styles.callMeta}>
            <CallIcon size={14} color={isMissed ? TEXAColors.accentRed : TEXAColors.dark[500]} />
            <Text style={[styles.callStatus, isMissed && styles.callMissed]}>
              {isMissed ? "Missed" : isIncoming ? "Incoming" : "Outgoing"}
            </Text>
            {call.duration > 0 && (
              <Text style={styles.callDuration}>{formatDuration(call.duration)}</Text>
            )}
          </View>
        </View>

        {/* Time */}
        <Text style={styles.callTime}>{formatCallTime(call.createdAt)}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CallsScreen() {
  const [filter, setFilter] = useState<"all" | "missed">("all");

  const filteredCalls = useMemo(() => {
    if (filter === "missed") return mockCalls.filter((c) => c.status === "missed");
    return mockCalls;
  }, [filter]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Calls</Text>
          <Text style={styles.headerSubtitle}>
            {mockCalls.length} recent calls
          </Text>
        </View>
        <TouchableOpacity style={styles.newCallButton}>
          <Plus size={20} color={TEXAColors.gold[400]} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.filterActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "missed" && styles.filterActive]}
          onPress={() => setFilter("missed")}
        >
          <Text style={[styles.filterText, filter === "missed" && styles.filterTextActive]}>
            Missed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Call list */}
      <FlatList
        data={filteredCalls}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <CallRow call={item} index={index} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCircle}>
              <Phone size={28} color={TEXAColors.dark[400]} />
            </View>
            <Text style={styles.emptyTitle}>No calls</Text>
            <Text style={styles.emptySubtitle}>Your call history will appear here</Text>
          </View>
        }
      />

      {/* Encryption badge */}
      <View style={styles.encryptionBadge}>
        <Text style={styles.encryptionText}>
          🔒 All calls are end-to-end encrypted
        </Text>
      </View>
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
  newCallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEXAColors.bgDarkSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: TEXAColors.dark[200],
  },
  filterRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderRadius: 12,
    padding: 3,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  filterActive: {
    backgroundColor: TEXAColors.gold[400],
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXAColors.dark[500],
  },
  filterTextActive: {
    color: TEXAColors.bgDark,
  },
  listContent: {
    paddingBottom: 80,
  },
  callRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: TEXAColors.dark[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 19,
    fontWeight: "700",
    color: TEXAColors.textInverse,
  },
  callTypeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
  },
  callTypeVideo: {
    backgroundColor: TEXAColors.gold[300],
  },
  callInfo: {
    flex: 1,
  },
  callName: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXAColors.textInverse,
    marginBottom: 4,
  },
  callMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  callStatus: {
    fontSize: 13,
    color: TEXAColors.dark[500],
  },
  callMissed: {
    color: TEXAColors.accentRed,
  },
  callDuration: {
    fontSize: 13,
    color: TEXAColors.dark[500],
  },
  callTime: {
    fontSize: 12,
    color: TEXAColors.dark[600],
    marginLeft: 8,
  },
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
  },
  encryptionBadge: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: TEXAColors.dark[50],
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: TEXAColors.dark[200],
  },
  encryptionText: {
    fontSize: 11,
    color: TEXAColors.dark[500],
    fontWeight: "500",
  },
});
