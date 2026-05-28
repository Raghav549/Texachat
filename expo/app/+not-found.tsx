import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import TEXAColors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔒</Text>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>
        This conversation may have been deleted or is no longer accessible.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(tabs)/chats")}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Back to Chats</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEXAColors.bgDark,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXAColors.textInverse,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: TEXAColors.dark[600],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: TEXAColors.gold[400],
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXAColors.bgDark,
  },
});
