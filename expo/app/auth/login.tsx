import { router } from "expo-router";
import { useState } from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";
import TEXAColors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const { sendOTP } = useAuth();
  const [phone, setPhone] = useState("");
  const [countryCode] = useState("+1");
  const [loading, setLoading] = useState(false);

  const formattedPhone = phone.replace(/\D/g, "").slice(0, 10);

  const handleContinue = async () => {
    if (formattedPhone.length < 10) return;
    Keyboard.dismiss();
    setLoading(true);

    try {
      // Call backend to send OTP via Twilio Verify
      await sendOTP(`${countryCode}${formattedPhone}`);
      router.push({
        pathname: "/auth/verify",
        params: { phone: `${countryCode}${formattedPhone}` },
      });
    } catch (err: any) {
      console.warn("Send OTP error:", err.message);
      // Still navigate to verify screen for demo
      router.push({
        pathname: "/auth/verify",
        params: { phone: `${countryCode}${formattedPhone}` },
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = formattedPhone.length >= 10;

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
            <Text style={styles.title}>Enter your phone</Text>
            <Text style={styles.subtitle}>
              We'll send you a verification code to confirm your number
            </Text>
          </Animated.View>

          {/* Phone Input */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600).springify()}
            style={styles.inputContainer}
          >
            {/* Country code */}
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
              <View style={styles.divider} />
            </View>

            {/* Phone number */}
            <TextInput
              style={styles.phoneInput}
              placeholder="(555) 123-4567"
              placeholderTextColor={TEXAColors.dark[500]}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={14}
              cursorColor={TEXAColors.gold[400]}
              selectionColor={TEXAColors.gold[400]}
            />
          </Animated.View>

          {/* Info text */}
          <Animated.Text
            entering={FadeInDown.delay(400).duration(600).springify()}
            style={styles.info}
          >
            Carrier charges may apply. Your number is never shared.
          </Animated.Text>

          {/* Continue button */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(600).springify()}
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[styles.continueButton, isValid && styles.continueActive]}
              onPress={handleContinue}
              disabled={!isValid || loading}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.continueText,
                  isValid && styles.continueTextActive,
                ]}
              >
                {loading ? "Sending code..." : "Continue"}
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
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEXAColors.bgDarkSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TEXAColors.dark[200],
    overflow: "hidden",
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 12,
    paddingVertical: 18,
  },
  countryCodeText: {
    color: TEXAColors.textInverse,
    fontSize: 17,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: TEXAColors.dark[300],
    marginLeft: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: TEXAColors.textInverse,
    paddingVertical: 18,
    paddingRight: 20,
    letterSpacing: 1,
  },
  info: {
    fontSize: 13,
    color: TEXAColors.dark[600],
    marginTop: 16,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 100,
    left: 24,
    right: 24,
  },
  continueButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: TEXAColors.dark[200],
    alignItems: "center",
  },
  continueActive: {
    backgroundColor: TEXAColors.gold[400],
    shadowColor: TEXAColors.gold[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueText: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXAColors.dark[500],
    letterSpacing: 0.5,
  },
  continueTextActive: {
    color: TEXAColors.bgDark,
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
