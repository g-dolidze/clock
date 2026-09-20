import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useCancelReservation, useReservation } from "../../src/hooks/useReservations";
import { useRestaurant } from "../../src/hooks/useRestaurants";
import { ReservationStatusBadge } from "../../src/components/StatusBadge";
import { EmptyState } from "../../src/components/EmptyState";
import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { useRealtimeStore } from "../../src/store/realtimeStore";
import { formatSlotTime } from "../../src/lib/date";
import { colors, spacing } from "../../src/theme";

export default function ReservationStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useReservation(id);
  const cancelReservation = useCancelReservation();
  const connected = useRealtimeStore((s) => s.connected);
  const { data: restaurantData } = useRestaurant(data?.reservation.restaurantId);

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
        <EmptyState title="Reservation not found" />
      </View>
    );
  }

  const { reservation } = data;
  const restaurant = restaurantData?.restaurant;

  return (
    <View style={styles.screen}>
      <Text style={styles.liveIndicator}>{connected ? "● Live" : "○ Reconnecting…"}</Text>

      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <ReservationStatusBadge status={reservation.status} />
          <Text style={styles.reservationId}>#{reservation.id.slice(-8)}</Text>
        </View>
        {restaurant && <Text style={styles.restaurantName}>{restaurant.name}</Text>}
        <Text style={styles.details}>
          Party of {reservation.partySize} ·{" "}
          {restaurant ? formatSlotTime(reservation.time, restaurant.timezone) : reservation.time}
        </Text>
        {reservation.status === "pending" && (
          <Text style={styles.pendingNote}>
            No table is free right now for that time — the restaurant will confirm as soon as one
            opens up.
          </Text>
        )}
        {reservation.status === "seated" && (
          <Text style={styles.seatedNote}>You're seated — enjoy your meal!</Text>
        )}
        {reservation.note && <Text style={styles.note}>Note: {reservation.note}</Text>}
      </Card>

      {(reservation.status === "pending" || reservation.status === "confirmed") && (
        <Button
          label="Cancel reservation"
          variant="danger"
          loading={cancelReservation.isPending}
          onPress={() => cancelReservation.mutate(reservation.id)}
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
    gap: spacing.sm,
    padding: spacing.lg,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reservationId: {
    color: colors.textFaint,
    fontSize: 12,
  },
  restaurantName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  details: {
    color: colors.textMuted,
    fontSize: 14,
  },
  pendingNote: {
    color: colors.warning,
    fontSize: 13,
  },
  seatedNote: {
    color: colors.success,
    fontSize: 13,
  },
  note: {
    color: colors.textFaint,
    fontSize: 13,
  },
});
