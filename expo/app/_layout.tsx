import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/hooks/useAuth";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
            <Stack.Screen name="auth/login" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="auth/verify" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="chat/[id]"
              options={{
                animation: "slide_from_right",
                headerShown: false,
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  );
}
