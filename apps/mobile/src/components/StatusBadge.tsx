import { StyleSheet, Text, View } from "react-native";
import type { OrderStatus, ReservationStatus, TableStatus } from "@ontime/web-shared/server";
import { colors, radius, spacing } from "../theme";

const ORDER_TONE: Record<OrderStatus, string> = {
  placed: colors.info,
  confirmed: colors.info,
  preparing: colors.warning,
  ready: colors.success,
  completed: colors.textMuted,
  cancelled: colors.danger,
};

const RESERVATION_TONE: Record<ReservationStatus, string> = {
  pending: colors.warning,
  confirmed: colors.info,
  seated: colors.success,
  completed: colors.textMuted,
  cancelled: colors.danger,
};

const TABLE_TONE: Record<TableStatus, string> = {
  free: colors.success,
  reserved: colors.warning,
  occupied: colors.danger,
};

function Badge({ label, tone }: { label: string; tone: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${tone}26` }]}>
      <Text style={[styles.text, { color: tone }]}>{label}</Text>
    </View>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge label={status} tone={ORDER_TONE[status]} />;
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge label={status} tone={RESERVATION_TONE[status]} />;
}

export function TableStatusBadge({ status }: { status: TableStatus }) {
  return <Badge label={status} tone={TABLE_TONE[status]} />;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
