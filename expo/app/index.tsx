import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import TEXAColors from "@/constants/colors";

export default function SplashScreen() {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const ringScale = useSharedValue(0.7);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo entrance
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 600 });

    // Animate pulse ring
    ringOpacity.value = withDelay(300, withTiming(0.6, { duration: 400 }));
    ringScale.value = withDelay(
      300,
      withSequence(
        withSpring(1.3, { damping: 14 }),
        withTiming(1, { duration: 300 })
      )
    );

    // Navigate after delay
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.glow} />
      <View style={styles.glowSecondary} />

      {/* Pulse ring */}
      <Animated.View style={[styles.ring, ringStyle]} />

      {/* TEXA Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.shield}>
          <View style={styles.shieldInner}>
            <View style={styles.diamond} />
            <View style={styles.sparkTop} />
            <View style={styles.sparkBottom} />
          </View>
        </View>
      </Animated.View>

      {/* Brand name */}
      <Animated.Text
        entering={FadeInDown.delay(600).duration(800).springify()}
        exiting={FadeOut}
        style={styles.brandText}
      >
        TEXA
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(900).duration(800).springify()}
        exiting={FadeOut}
        style={styles.tagline}
      >
        Connect Beyond Limits
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEXAColors.bgDark,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: TEXAColors.gold[400],
    opacity: 0.08,
    top: "35%",
    left: "50%",
    marginLeft: -140,
    marginTop: -140,
  },
  glowSecondary: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: TEXAColors.gold[200],
    opacity: 0.06,
    top: "35%",
    left: "50%",
    marginLeft: -90,
    marginTop: -90,
  },
  ring: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: TEXAColors.gold[400],
    opacity: 0,
  },
  logoContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  shield: {
    width: 72,
    height: 82,
    borderRadius: 14,
    backgroundColor: TEXAColors.gold[400],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: TEXAColors.gold[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  shieldInner: {
    width: 40,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  diamond: {
    width: 24,
    height: 24,
    backgroundColor: TEXAColors.bgDark,
    transform: [{ rotate: "45deg" }],
    borderRadius: 3,
  },
  sparkTop: {
    position: "absolute",
    top: 0,
    width: 4,
    height: 10,
    backgroundColor: TEXAColors.gold[200],
    borderRadius: 2,
  },
  sparkBottom: {
    position: "absolute",
    bottom: 0,
    width: 4,
    height: 10,
    backgroundColor: TEXAColors.gold[200],
    borderRadius: 2,
  },
  brandText: {
    marginTop: 28,
    fontSize: 42,
    fontWeight: "800",
    color: TEXAColors.gold[400],
    letterSpacing: 8,
  },
  tagline: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "400",
    color: TEXAColors.dark[700],
    letterSpacing: 3,
    textTransform: "uppercase",
  },
});
