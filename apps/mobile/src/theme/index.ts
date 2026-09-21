// Matches apps/customer's branding (index.css / tailwind theme): dark ink
// background, orange accent, Archivo/Plus Jakarta Sans/IBM Plex Mono type
// scale. Custom fonts aren't loaded here (see README) — this just keeps
// color usage consistent across every screen.
export const colors = {
  ink: "#211714",
  inkLight: "#2f231f",
  card: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.12)",
  accent: "#e3572c",
  accentLight: "#ff8a5c",
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.6)",
  textFaint: "rgba(255,255,255,0.4)",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  info: "#38bdf8",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;
