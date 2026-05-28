import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import TEXAColors from "@/constants/colors";
import texaApi from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const shakeX = useSharedValue(0);

  // Focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputsRef.current[0]?.focus(), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError("");

    // Auto-advance to next input
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 5) {
      handleVerify(newCode.join(""));
    } else if (newCode.every((d) => d.length === 1)) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string) => {
    if (fullCode.length !== 6) return;
    Keyboard.dismiss();
    setLoading(true);
    setError("");

    try {
      // In production: verify OTP with Twilio Verify API via backend
      await login(phone, fullCode);
      router.replace("/(tabs)/chats");
    } catch {
      setError("Invalid code. Please try again.");
      shakeX.value = withSequence(
        withTiming(-12, { duration: 50 }),
        withRepeat(withTiming(12, { duration: 100 }), 3, true),
        withTiming(0, { duration: 50 })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // In production: resend OTP via Twilio
    setCode(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const maskedPhone = phone
    ? `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`
    : "";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(600).springify()}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{"\n"}
              <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
            </Text>
          </Animated.View>

          {/* Code inputs */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={shakeStyle}
          >
            <View style={styles.codeRow}>
              {code.map((digit, i) => (
                <View
                  key={i}
                  style={[
                    styles.codeBox,
                    digit ? styles.codeBoxFilled : null,
                    error ? styles.codeBoxError : null,
                  ]}
                >
                  <TextInput
                    ref={(ref) => {
                      inputsRef.current[i] = ref;
                    }}
                    style={styles.codeInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(t) => handleCodeChange(t, i)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(nativeEvent.key, i)
                    }
                    cursorColor={TEXAColors.gold[400]}
                    selectionColor="transparent"
                    selectTextOnFocus={false}
                  />
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Error message */}
          {error ? (
            <Animated.Text
              entering={FadeInDown.duration(300)}
              style={styles.errorText}
            >
              {error}
            </Animated.Text>
          ) : (
            <View style={styles.errorPlaceholder} />
          )}

          {/* Loading indicator */}
          {loading && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <Text style={styles.loadingText}>Verifying...</Text>
            </Animated.View>
          )}

          {/* Resend */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResend}
            >
              <Text style={styles.resendText}>
                Didn't receive a code?{" "}
                <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* TEXA branding */}
          <Text style={styles.branding}>TEXA</Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TEXAColors.bgDark,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEXAColors.bgDarkSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  backArrow: {
    color: TEXAColors.textInverse,
    fontSize: 22,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXAColors.textInverse,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: TEXAColors.dark[700],
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  phoneHighlight: {
    color: TEXAColors.gold[400],
    fontWeight: "600",
  },
  codeRow: {
    flexDirection: "row",
    gap: 12,
  },
  codeBox: {
    width: 48,
    height: 58,
    borderRadius: 14,
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderWidth: 1.5,
    borderColor: TEXAColors.dark[200],
    alignItems: "center",
    justifyContent: "center",
  },
  codeBoxFilled: {
    borderColor: TEXAColors.gold[400],
    backgroundColor: TEXAColors.dark[100],
    shadowColor: TEXAColors.gold[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  codeBoxError: {
    borderColor: TEXAColors.accentRed,
  },
  codeInput: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXAColors.textInverse,
    textAlign: "center",
    width: "100%",
    height: "100%",
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: TEXAColors.accentRed,
    fontWeight: "500",
  },
  errorPlaceholder: {
    height: 36,
  },
  loadingText: {
    fontSize: 14,
    color: TEXAColors.gold[400],
    fontWeight: "500",
  },
  resendButton: {
    marginTop: 32,
  },
  resendText: {
    fontSize: 14,
    color: TEXAColors.dark[600],
  },
  resendLink: {
    color: TEXAColors.gold[400],
    fontWeight: "600",
  },
  branding: {
    position: "absolute",
    bottom: 44,
    fontSize: 14,
    fontWeight: "700",
    color: TEXAColors.dark[400],
    letterSpacing: 6,
  },
});
