import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import TEXAColors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    id: "1",
    icon: "🔐",
    title: "Military-Grade\nEncryption",
    description:
      "Every message, call, and file is protected with end-to-end encryption. Not even TEXA can read your conversations.",
  },
  {
    id: "2",
    icon: "⚡",
    title: "Blazing Fast\nRealtime Chat",
    description:
      "Experience instant messaging with zero lag. Massive groups, HD media, and crystal-clear calls — all in realtime.",
  },
  {
    id: "3",
    icon: "🌐",
    title: "Connect Beyond\nLimits",
    description:
      "Communities, channels, stories, and more. The most powerful communication platform, designed for the future.",
  },
] as const;

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const progress = useSharedValue(0);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next });
      setCurrentIndex(next);
      progress.value = withTiming(next / (ONBOARDING_DATA.length - 1), {
        duration: 400,
      });
    } else {
      router.push("/auth/login");
    }
  };

  const handleSkip = () => {
    router.push("/auth/login");
  };

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${((progress.value * 2 + (currentIndex > 0 ? 1 : 0)) / 3) * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Icon circle */}
            <Animated.View
              entering={FadeInDown.duration(800).springify()}
              style={styles.iconCircle}
            >
              <Text style={styles.iconText}>{item.icon}</Text>
            </Animated.View>

            {/* Title */}
            <Animated.Text
              entering={FadeInDown.delay(200).duration(800).springify()}
              style={styles.title}
            >
              {item.title}
            </Animated.Text>

            {/* Description */}
            <Animated.Text
              entering={FadeInUp.delay(400).duration(800).springify()}
              style={styles.description}
            >
              {item.description}
            </Animated.Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {ONBOARDING_DATA.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
                i < currentIndex && styles.dotCompleted,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <View style={styles.ctaGradient}>
            <Text style={styles.ctaText}>
              {currentIndex === ONBOARDING_DATA.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legal}>
          By continuing, you agree to TEXA's Terms of Service and Privacy Policy
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
  skipButton: {
    position: "absolute",
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: TEXAColors.dark[700],
    fontSize: 15,
    fontWeight: "500",
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: TEXAColors.bgDarkSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: TEXAColors.dark[200],
    shadowColor: TEXAColors.gold[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: TEXAColors.textInverse,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: "400",
    color: TEXAColors.dark[700],
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
    gap: 20,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEXAColors.dark[300],
  },
  dotActive: {
    width: 24,
    backgroundColor: TEXAColors.gold[400],
  },
  dotCompleted: {
    backgroundColor: TEXAColors.gold[400],
    opacity: 0.4,
  },
  ctaButton: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: TEXAColors.gold[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGradient: {
    backgroundColor: TEXAColors.gold[400],
    paddingVertical: 18,
    alignItems: "center",
  },
  ctaText: {
    color: TEXAColors.bgDark,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  legal: {
    fontSize: 12,
    color: TEXAColors.dark[600],
    textAlign: "center",
    lineHeight: 18,
  },
});
