import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "../src/lib/queryClient";
import { useCustomerRealtime } from "../src/hooks/useRealtime";
import { colors } from "../src/theme";

function RootStack() {
  useCustomerRealtime();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.ink },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="restaurant/[id]" options={{ title: "" }} />
      <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
      <Stack.Screen name="orders/[id]" options={{ title: "Order status" }} />
      <Stack.Screen name="reservations/[id]" options={{ title: "Reservation" }} />
      <Stack.Screen name="login" options={{ title: "Sign in", presentation: "modal" }} />
      <Stack.Screen name="+not-found" options={{ title: "Not found" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootStack />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
