import { config } from "../config";

const TWILIO_BASE = "https://verify.twilio.com/v2";

interface TwilioVerifyResponse {
  status: string;
  valid: boolean;
  to: string;
  sid: string;
}

/**
 * Send OTP verification code via Twilio Verify.
 */
export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    const url = `${TWILIO_BASE}/Services/${config.twilio.verifyServiceSid}/Verifications`;
    const auth = Buffer.from(
      `${config.twilio.accountSid}:${config.twilio.authToken}`
    ).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: new URLSearchParams({
        To: phoneNumber,
        Channel: "sms",
      }).toString(),
    });

    const data = await response.json() as TwilioVerifyResponse;
    if (data.status === "pending") {
      return { success: true, sid: data.sid };
    }
    return { success: false, error: data.status || "Failed to send verification code" };
  } catch (error: any) {
    console.error("[Twilio] Send OTP error:", error.message);
    return { success: false, error: "Failed to send verification code" };
  }
}

/**
 * Verify OTP code via Twilio Verify Check.
 */
export async function verifyOTP(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${TWILIO_BASE}/Services/${config.twilio.verifyServiceSid}/VerificationCheck`;
    const auth = Buffer.from(
      `${config.twilio.accountSid}:${config.twilio.authToken}`
    ).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: new URLSearchParams({
        To: phoneNumber,
        Code: code,
      }).toString(),
    });

    const data = await response.json() as TwilioVerifyResponse;
    if (data.status === "approved") {
      return { success: true };
    }
    return { success: false, error: "Invalid verification code" };
  } catch (error: any) {
    console.error("[Twilio] Verify OTP error:", error.message);
    return { success: false, error: "Verification failed" };
  }
}
