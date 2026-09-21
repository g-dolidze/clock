import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatCents, type MenuItem } from "@ontime/web-shared/server";
import { colors, radius, spacing } from "../theme";

export function MenuItemRow({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>{formatCents(item.priceCents)}</Text>
      </View>
      <Pressable
        disabled={!item.available}
        onPress={onAdd}
        style={({ pressed }) => [
          styles.addButton,
          !item.available && styles.addButtonDisabled,
          pressed && item.available && { opacity: 0.85 },
        ]}
      >
        <Text style={[styles.addLabel, !item.available && styles.addLabelDisabled]}>
          {item.available ? "Add" : "Sold out"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  description: {
    color: colors.textMuted,
    fontSize: 12,
  },
  price: {
    color: colors.text,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  addButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  addLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  addLabelDisabled: {
    color: colors.textFaint,
  },
});
