import AsyncStorage from "@react-native-async-storage/async-storage";

// Default to localhost; in production, use your deployed server URL
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

class TEXAApi {
  private token: string | null = null;

  async init(): Promise<void> {
    this.token = await AsyncStorage.getItem("texa_token");
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      AsyncStorage.setItem("texa_token", token);
    } else {
      AsyncStorage.removeItem("texa_token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T = ApiResponse>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data as T;
  }

  // ── Auth ───────────────────────────────────────────
  async sendOTP(phone: string) {
    return this.request<{ success: boolean; message: string; phone: string }>(
      "POST",
      "/auth/send-otp",
      { phone }
    );
  }

  async verifyOTP(phone: string, code: string, deviceName?: string) {
    return this.request<{
      success: boolean;
      token: string;
      refreshToken: string;
      sessionId: string;
      user: any;
    }>("POST", "/auth/verify-otp", {
      phone,
      code,
      deviceName: deviceName || "Android Device",
      deviceInfo: "React Native",
    });
  }

  async getMe() {
    return this.request<{ user: any }>("GET", "/auth/me");
  }

  async logout() {
    return this.request<{ success: boolean }>("POST", "/auth/logout");
  }

  async updateProfile(updates: Record<string, any>) {
    return this.request<{ success: boolean; user: any }>(
      "PUT",
      "/auth/profile",
      updates
    );
  }

  async getDevices() {
    return this.request<{ devices: any[] }>("GET", "/auth/devices");
  }

  async revokeDevice(deviceId: string) {
    return this.request<{ success: boolean }>(
      "POST",
      "/auth/devices/revoke",
      { deviceId }
    );
  }

  // ── Chats ──────────────────────────────────────────
  async getChats() {
    return this.request<{ chats: any[] }>("GET", "/chats");
  }

  async createChat(type: string, participantIds: string[], name?: string) {
    return this.request<{ success: boolean; chat: any }>(
      "POST",
      "/chats",
      { type, participantIds, name }
    );
  }

  async getMessages(chatId: string, before?: string, limit = 50) {
    const query = new URLSearchParams({ limit: String(limit) });
    if (before) query.set("before", before);
    return this.request<{ messages: any[] }>(
      "GET",
      `/chats/${chatId}/messages?${query.toString()}`
    );
  }

  async sendMessage(
    chatId: string,
    type: string,
    content: string,
    options?: { mediaUrl?: string; mediaEncryptedKey?: string; replyToId?: string }
  ) {
    return this.request<{ success: boolean; message: any }>(
      "POST",
      `/chats/${chatId}/messages`,
      { type, content, ...options }
    );
  }

  async markRead(chatId: string, messageIds: string[]) {
    return this.request<{ success: boolean }>(
      "POST",
      `/chats/${chatId}/read`,
      { messageIds }
    );
  }

  async deleteMessage(chatId: string, messageId: string) {
    return this.request<{ success: boolean }>(
      "DELETE",
      `/chats/${chatId}/messages/${messageId}`
    );
  }
}

export const texaApi = new TEXAApi();
export default texaApi;
