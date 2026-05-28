import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  User,
  Lock,
  Shield,
  Bell,
  Palette,
  Globe,
  Database,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Fingerprint,
  Key,
  Eye,
  EyeOff,
  Smartphone,
} from "lucide-react-native";
import TEXAColors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";

function SettingRow({
  icon: Icon,
  label,
  subtitle,
  right,
  onPress,
  danger,
}: {
  icon: typeof User;
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Icon size={20} color={danger ? TEXAColors.accentRed : TEXAColors.gold[400]} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
          {label}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {right ?? <ChevronRight size={18} color={TEXAColors.dark[500]} />}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [biometricLock, setBiometricLock] = useState(true);
  const [hideOnline, setHideOnline] = useState(false);
  const [hideReadReceipts, setHideReadReceipts] = useState(false);
  const [encryptedBackups, setEncryptedBackups] = useState(true);
  const [screenshotProtection, setScreenshotProtection] = useState(true);

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Security & Privacy</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <Animated.View entering={FadeInDown.duration(500).springify()}>
          <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {user?.displayName?.charAt(0) ?? "T"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName ?? "TEXA User"}</Text>
              <Text style={styles.profilePhone}>{user?.phone ?? "+1 (555) 123-4567"}</Text>
            </View>
            <ChevronRight size={18} color={TEXAColors.dark[500]} />
          </TouchableOpacity>
        </Animated.View>

        {/* Security & Privacy */}
        <SectionHeader title="Security & Privacy" />
        <View style={styles.sectionCard}>
          <SettingRow
            icon={Fingerprint}
            label="Biometric Lock"
            subtitle="Require fingerprint or face to open TEXA"
            right={
              <Switch
                value={biometricLock}
                onValueChange={setBiometricLock}
                trackColor={{ false: TEXAColors.dark[300], true: TEXAColors.gold[400] }}
                thumbColor={TEXAColors.bgDark}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon={Key}
            label="Encryption Keys"
            subtitle="Manage your end-to-end encryption keys"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon={Shield}
            label="Screenshot Protection"
            subtitle="Block screenshots in secret chats"
            right={
              <Switch
                value={screenshotProtection}
                onValueChange={setScreenshotProtection}
                trackColor={{ false: TEXAColors.dark[300], true: TEXAColors.gold[400] }}
                thumbColor={TEXAColors.bgDark}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon={EyeOff}
            label="Hide Online Status"
            subtitle="Control who can see when you're online"
            right={
              <Switch
                value={hideOnline}
                onValueChange={setHideOnline}
                trackColor={{ false: TEXAColors.dark[300], true: TEXAColors.gold[400] }}
                thumbColor={TEXAColors.bgDark}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon={Eye}
            label="Read Receipts"
            subtitle="Show when you've read messages"
            right={
              <Switch
                value={!hideReadReceipts}
                onValueChange={(v) => setHideReadReceipts(!v)}
                trackColor={{ false: TEXAColors.dark[300], true: TEXAColors.gold[400] }}
                thumbColor={TEXAColors.bgDark}
              />
            }
          />
        </View>

        {/* Data & Storage */}
        <SectionHeader title="Data & Storage" />
        <View style={styles.sectionCard}>
          <SettingRow
            icon={Database}
            label="Encrypted Backup"
            subtitle="Securely backup chats to the cloud"
            right={
              <Switch
                value={encryptedBackups}
                onValueChange={setEncryptedBackups}
                trackColor={{ false: TEXAColors.dark[300], true: TEXAColors.gold[400] }}
                thumbColor={TEXAColors.bgDark}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon={Smartphone}
            label="Device Management"
            subtitle="Manage connected devices and sessions"
            onPress={() => {}}
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <View style={styles.sectionCard}>
          <SettingRow icon={Bell} label="Notification Settings" onPress={() => {}} />
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View style={styles.sectionCard}>
          <SettingRow icon={Palette} label="Chat Theme" subtitle="Dark" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon={Globe} label="Language" subtitle="English" onPress={() => {}} />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.sectionCard}>
          <SettingRow icon={HelpCircle} label="Help & Support" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon={Info} label="About TEXA" subtitle="Version 1.0.0 • Beta" onPress={() => {}} />
        </View>

        {/* Encryption notice */}
        <View style={styles.encryptionNotice}>
          <Lock size={14} color={TEXAColors.gold[400]} />
          <Text style={styles.encryptionText}>
            All your data is end-to-end encrypted. TEXA cannot read your messages or calls.
          </Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={18} color={TEXAColors.accentRed} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEXAColors.bgDark,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // ── Profile Card ─────────────────────────────────────
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    padding: 16,
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TEXAColors.dark[200],
    marginBottom: 28,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXAColors.bgDark,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXAColors.textInverse,
  },
  profilePhone: {
    fontSize: 13,
    color: TEXAColors.dark[500],
    marginTop: 2,
  },
  // ── Sections ─────────────────────────────────────────
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXAColors.gold[400],
    letterSpacing: 2,
    textTransform: "uppercase",
    paddingHorizontal: 28,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TEXAColors.dark[200],
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: TEXAColors.dark[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingIconDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.10)",
  },
  settingContent: {
    flex: 1,
    marginRight: 8,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXAColors.textInverse,
  },
  settingLabelDanger: {
    color: TEXAColors.accentRed,
  },
  settingSubtitle: {
    fontSize: 12,
    color: TEXAColors.dark[600],
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: TEXAColors.dark[200],
    marginLeft: 62,
  },
  // ── Encryption Notice ────────────────────────────────
  encryptionNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 16,
    padding: 14,
    backgroundColor: TEXAColors.dark[50],
    borderRadius: 14,
    gap: 10,
    borderWidth: 0.5,
    borderColor: TEXAColors.dark[200],
  },
  encryptionText: {
    flex: 1,
    fontSize: 12,
    color: TEXAColors.dark[600],
    lineHeight: 18,
  },
  // ── Logout ───────────────────────────────────────────
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXAColors.accentRed,
  },
  bottomSpacer: {
    height: 40,
  },
});
