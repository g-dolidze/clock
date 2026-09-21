import { StyleSheet, Text, View } from "react-native";
import { formatCents, type Payment } from "@ontime/web-shared/server";
import { useConfirmMockPayment } from "../hooks/usePayments";
import { Button } from "./Button";
import { colors, radius, spacing } from "../theme";

// The web app can use real Stripe Elements; Stripe's React Native SDK needs
// native module linking (a custom dev client, not plain Expo Go), so this
// app always uses the same mock-payment confirmation the web app falls
// back to when no Stripe key is configured — checkout still works
// end-to-end without it. Wiring @stripe/stripe-react-native in is future
// work once the app has a dev client build.
export function PaymentPanel({ payment, onSuccess }: { payment: Payment; onSuccess: () => void }) {
  const confirmMock = useConfirmMockPayment();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.amount}>{formatCents(payment.amountCents)}</Text>
      </View>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Checkout uses a mock payment on mobile for now — this confirms the order the same way a
          real card payment would.
        </Text>
      </View>
      {confirmMock.isError && <Text style={styles.error}>Payment failed. Please try again.</Text>}
      <Button
        label="Confirm mock payment"
        loading={confirmMock.isPending}
        onPress={() => confirmMock.mutate(payment.id, { onSuccess })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  header: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  amount: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  notice: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: spacing.md,
  },
  noticeText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
