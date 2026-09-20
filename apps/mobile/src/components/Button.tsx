import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors, radius, spacing } from "../theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  loading?: boolean;
  label: string;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; fg: string }> = {
  primary: { bg: colors.accent, fg: "#ffffff" },
  secondary: { bg: "rgba(255,255,255,0.1)", fg: "#ffffff" },
  ghost: { bg: "transparent", fg: "#ffffff" },
  danger: { bg: "#dc2626", fg: "#ffffff" },
};

export function Button({ variant = "primary", loading, label, disabled, style, ...rest }: ButtonProps) {
  const { bg, fg } = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : state.pressed ? 0.85 : 1 },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {loading && <ActivityIndicator size="small" color={fg} style={styles.spinner} />}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radius.pill,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  spinner: {
    marginRight: spacing.sm,
  },
});
