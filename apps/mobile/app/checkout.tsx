import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { formatCents, type Order, type Payment } from "@ontime/web-shared/server";
import { cartTotalCents, useCartStore } from "../src/store/cartStore";
import { useRestaurant } from "../src/hooks/useRestaurants";
import { useCreateOrder } from "../src/hooks/useOrders";
import { useCreatePaymentIntent } from "../src/hooks/usePayments";
import { PaymentPanel } from "../src/components/PaymentPanel";
import { Button } from "../src/components/Button";
import { Card } from "../src/components/Card";
import { EmptyState } from "../src/components/EmptyState";
import { useAuthStore } from "../src/store/authStore";
import { colors, radius, spacing } from "../src/theme";

export default function CheckoutScreen() {
  const router = useRouter();
  const customer = useAuthStore((s) => s.customer);
  const { restaurantId, lines, fulfillmentType, setQuantity, setFulfillmentType, clear } = useCartStore();
  const { data } = useRestaurant(restaurantId ?? undefined);
  const [note, setNote] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

  const createOrder = useCreateOrder();
  const createPaymentIntent = useCreatePaymentIntent();

  useEffect(() => {
    if (order && !payment && !createPaymentIntent.isPending) {
      createPaymentIntent.mutate(order.id, { onSuccess: (res) => setPayment(res.payment) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  if (lines.length === 0 && !order) {
    return (
      <View style={styles.screen}>
        <EmptyState
          title="Your cart is empty"
          description="Browse restaurants and add something to order ahead."
          action={<Button label="Find a restaurant" variant="secondary" onPress={() => router.push("/")} />}
        />
      </View>
    );
  }

  if (!customer && !order) {
    return (
      <View style={styles.screen}>
        <EmptyState
          title="Sign in to check out"
          description="We use this to track your order and let you check its status."
          action={<Button label="Sign in" onPress={() => router.push("/login")} />}
        />
      </View>
    );
  }

  const total = cartTotalCents(lines);

  function placeOrder() {
    if (!restaurantId) return;
    createOrder.mutate(
      {
        restaurantId,
        fulfillmentType,
        items: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
        note: note || undefined,
      },
      { onSuccess: (res) => setOrder(res.order) },
    );
  }

  function handlePaymentSuccess() {
    clear();
    if (order) router.replace(`/orders/${order.id}`);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {data && <Text style={styles.restaurantName}>{data.restaurant.name}</Text>}

      {!order && (
        <>
          <Card style={styles.cartCard}>
            {lines.map((line, index) => (
              <View
                key={line.menuItemId}
                style={[styles.cartRow, index > 0 && styles.cartRowBorder]}
              >
                <View style={styles.cartRowInfo}>
                  <Text style={styles.cartItemName}>{line.name}</Text>
                  <Text style={styles.cartItemPrice}>{formatCents(line.priceCents)} each</Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => setQuantity(line.menuItemId, line.quantity - 1)}
                    style={styles.stepperButton}
                  >
                    <Text style={styles.stepperButtonText}>{line.quantity === 1 ? "✕" : "–"}</Text>
                  </Pressable>
                  <Text style={styles.stepperValue}>{line.quantity}</Text>
                  <Pressable
                    onPress={() => setQuantity(line.menuItemId, line.quantity + 1)}
                    style={styles.stepperButton}
                  >
                    <Text style={styles.stepperButtonText}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <View style={[styles.cartRow, styles.cartRowBorder, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCents(total)}</Text>
            </View>
          </Card>

          <Text style={styles.fieldLabel}>Fulfillment</Text>
          <View style={styles.fulfillmentRow}>
            {(["pickup", "dine-in"] as const).map((option) => (
              <Pressable
                key={option}
                onPress={() => setFulfillmentType(option)}
                style={[styles.fulfillmentOption, fulfillmentType === option && styles.fulfillmentOptionActive]}
              >
                <Text
                  style={[
                    styles.fulfillmentOptionText,
                    fulfillmentType === option && styles.fulfillmentOptionTextActive,
                  ]}
                >
                  {option === "dine-in" ? "Dine-in" : "Pickup"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Note for the kitchen (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Allergies, extra sauce, etc."
            placeholderTextColor={colors.textFaint}
            style={styles.noteInput}
            multiline
          />

          {createOrder.isError && <Text style={styles.error}>Couldn't place your order. Please try again.</Text>}

          <Button
            label={`Place order — ${formatCents(total)}`}
            loading={createOrder.isPending}
            onPress={placeOrder}
          />
        </>
      )}

      {order && !payment && <Text style={styles.preparing}>Preparing payment…</Text>}

      {order && payment && <PaymentPanel payment={payment} onSuccess={handlePaymentSuccess} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  restaurantName: {
    color: colors.textMuted,
    fontSize: 14,
  },
  cartCard: {
    padding: spacing.sm,
  },
  cartRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  cartRowBorder: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cartRowInfo: {
    flex: 1,
    gap: 2,
  },
  cartItemName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  cartItemPrice: {
    color: colors.textFaint,
    fontSize: 12,
  },
  stepper: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  stepperButton: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  stepperButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  stepperValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    minWidth: 16,
    textAlign: "center",
  },
  totalRow: {
    marginTop: spacing.xs,
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  totalValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  fulfillmentRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  fulfillmentOption: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    paddingVertical: spacing.md,
  },
  fulfillmentOptionActive: {
    backgroundColor: "rgba(227,87,44,0.15)",
    borderColor: colors.accent,
  },
  fulfillmentOptionText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  fulfillmentOptionTextActive: {
    color: colors.text,
  },
  noteInput: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    minHeight: 60,
    padding: spacing.md,
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  preparing: {
    color: colors.textMuted,
    paddingVertical: spacing.xl,
    textAlign: "center",
  },
});
