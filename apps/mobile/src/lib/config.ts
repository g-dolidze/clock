import { Platform } from "react-native";
import Constants from "expo-constants";

function platformDefaultApiBaseUrl(): string {
  // The Android emulator can't reach the host machine at 127.0.0.1/localhost
  // — 10.0.2.2 is the documented alias for that. iOS simulators and web can
  // use the host loopback directly. A physical device needs a real LAN IP
  // or a tunnel (ngrok, etc.) — set EXPO_PUBLIC_API_BASE_URL for that case.
  if (Platform.OS === "android") return "http://10.0.2.2:3000";
  return "http://127.0.0.1:3000";
}

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || extra?.apiBaseUrl || platformDefaultApiBaseUrl();
