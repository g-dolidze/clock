import { useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { formatCents } from "@ontime/web-shared/server";
import { useMyOrders } from "../../src/hooks/useOrders";
import { useMyReservations } from "../../src/hooks/useReservations";
import { useAuthStore } from "../../src/store/authStore";
import { OrderStatusBadge, ReservationStatusBadge } from "../../src/components/StatusBadge";
import { EmptyState } from "../../src/components/EmptyState";
import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { colors, spacing } from "../../src/theme";

type Tab = "orders" | "reservations";

export default function AccountScreen() {
  const router = useRouter();
  const customer = useAuthStore((s) => s.customer);
  const logout = useAuthStore((s) => s.logout);

  if (!customer) {
    return (
      <View style={styles.loggedOut}>
        <EmptyState
          title="Sign in to see your orders"
          description="Track orders and reservations you've placed on this device."
          action={<Button label="Sign in" onPress={() => router.push("/login")} />}
        />
      </View>
    );
  }

  return <SignedInAccount name={customer.name} email={customer.email} onLogout={logout} />;
}

function SignedInAccount({ name, email, onLogout }: { name: string; email: string; onLogout: () => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const orders = useMyOrders();
  const reservations = useMyReservations();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>Hi, {name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
        <Button label="Sign out" variant="ghost" onPress={onLogout} />
      </View>

      <View style={styles.tabRow}>
        {(["orders", "reservations"] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={styles.tabButton}>
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === "orders" ? "Orders" : "Reservations"}
            </Text>
            {tab === t && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </View>

      {tab === "orders" && (
        <FlatList
          data={orders.data?.orders ?? []}
          keyExtractor={(o) => o.id}
          ListEmptyComponent={
            orders.isLoading ? (
              <ActivityIndicator color={colors.accent} style={styles.loading} />
            ) : (
              <EmptyState title="No orders yet" description="Order ahead from any restaurant page." />
            )
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/orders/${item.id}`)}>
              <Card style={styles.rowCard}>
                <View>
                  <Text style={styles.rowTitle}>
                    {item.items.length} item(s) · {item.fulfillmentType}
                  </Text>
                  <Text style={styles.rowMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
                <View style={styles.rowEnd}>
                  <Text style={styles.rowAmount}>{formatCents(item.totalCents)}</Text>
                  <OrderStatusBadge status={item.status} />
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}

      {tab === "reservations" && (
        <FlatList
          data={reservations.data?.reservations ?? []}
          keyExtractor={(r) => r.id}
          ListEmptyComponent={
            reservations.isLoading ? (
              <ActivityIndicator color={colors.accent} style={styles.loading} />
            ) : (
              <EmptyState title="No reservations yet" description="Book a table from any restaurant page." />
            )
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/reservations/${item.id}`)}>
              <Card style={styles.rowCard}>
                <View>
                  <Text style={styles.rowTitle}>Party of {item.partySize}</Text>
                  <Text style={styles.rowMeta}>{new Date(item.time).toLocaleString()}</Text>
                </View>
                <ReservationStatusBadge status={item.status} />
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loggedOut: {
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  email: {
    color: colors.textFaint,
    fontSize: 12,
  },
  tabRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  tabButton: {
    paddingBottom: spacing.sm,
  },
  tabLabel: {
    color: colors.textFaint,
    fontSize: 14,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: colors.text,
  },
  tabIndicator: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    height: 2,
    marginTop: spacing.xs,
  },
  loading: {
    paddingVertical: spacing.xl,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  rowCard: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  rowMeta: {
    color: colors.textFaint,
    fontSize: 12,
    marginTop: 2,
  },
  rowEnd: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  rowAmount: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
