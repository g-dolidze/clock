import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { formatCents, type OrderStatus } from "@ontime/web-shared/server";
import { useCancelOrder, useOrder } from "../../src/hooks/useOrders";
import { OrderStatusBadge } from "../../src/components/StatusBadge";
import { EmptyState } from "../../src/components/EmptyState";
import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { useRealtimeStore } from "../../src/store/realtimeStore";
import { colors, spacing } from "../../src/theme";

const STEPS: OrderStatus[] = ["placed", "confirmed", "preparing", "ready", "completed"];

export default function OrderStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useOrder(id);
  const cancelOrder = useCancelOrder();
  const connected = useRealtimeStore((s) => s.connected);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (isError || !data) {
    return (
      <View style={styles.screen}>
        <EmptyState title="Order not found" />
      </View>
    );
  }

  const { order } = data;
  const stepIndex = STEPS.indexOf(order.status);

  return (
    <View style={styles.screen}>
      <Text style={styles.liveIndicator}>{connected ? "● Live" : "○ Reconnecting…"}</Text>

      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <OrderStatusBadge status={order.status} />
          <Text style={styles.orderId}>#{order.id.slice(-8)}</Text>
        </View>

        {order.status === "cancelled" ? (
          <Text style={styles.cancelled}>This order was cancelled.</Text>
        ) : (
          <View style={styles.progressRow}>
            {STEPS.map((step, i) => (
              <View
                key={step}
                style={[styles.progressSegment, i <= stepIndex ? styles.progressSegmentActive : undefined]}
              />
            ))}
          </View>
        )}
        <Text style={styles.fulfillment}>
          {order.fulfillmentType === "dine-in" ? "Dine-in" : "Pickup"} order
        </Text>

        <View style={styles.items}>
          {order.items.map((item) => (
            <View key={item.menuItemId} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}× {item.name}
              </Text>
              <Text style={styles.itemPrice}>{formatCents(item.priceCents * item.quantity)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCents(order.totalCents)}</Text>
        </View>
      </Card>

      {order.status === "placed" && (
        <Button
          label="Cancel order"
          variant="danger"
          loading={cancelOrder.isPending}
          onPress={() => cancelOrder.mutate(order.id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  center: {
    alignItems: "center",
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: "center",
  },
  liveIndicator: {
    color: colors.textFaint,
    fontSize: 12,
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderId: {
    color: colors.textFaint,
    fontSize: 12,
  },
  cancelled: {
    color: colors.danger,
    fontSize: 13,
  },
  progressRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  progressSegment: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    flex: 1,
    height: 6,
  },
  progressSegmentActive: {
    backgroundColor: colors.accent,
  },
  fulfillment: {
    color: colors.textFaint,
    fontSize: 12,
    textTransform: "capitalize",
  },
  items: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemName: {
    color: colors.textMuted,
    fontSize: 13,
  },
  itemPrice: {
    color: colors.textMuted,
    fontSize: 13,
  },
  totalRow: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  totalLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  totalValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
