import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Restaurant } from "@ontime/web-shared/server";
import { useAvailability } from "../hooks/useRestaurants";
import { useCreateReservation } from "../hooks/useReservations";
import { useAuthStore } from "../store/authStore";
import { addDaysInputValue, formatSlotTime } from "../lib/date";
import { EmptyState } from "./EmptyState";
import { colors, radius, spacing } from "../theme";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ReservationBooker({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const customer = useAuthStore((s) => s.customer);
  const [dayOffset, setDayOffset] = useState(0);
  const [partySize, setPartySize] = useState(2);
  const date = addDaysInputValue(dayOffset);
  const { data, isLoading } = useAvailability(restaurant.id, date, partySize);
  const createReservation = useCreateReservation();

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const iso = addDaysInputValue(i);
        const weekday = new Date(`${iso}T00:00:00`).getDay();
        return { offset: i, label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : DAY_LABELS[weekday] };
      }),
    [],
  );

  function bookSlot(time: string) {
    if (!customer) {
      router.push("/login");
      return;
    }
    createReservation.mutate(
      { restaurantId: restaurant.id, partySize, time },
      { onSuccess: (res) => router.push(`/reservations/${res.reservation.id}`) },
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
        {days.map((day) => (
          <Pressable
            key={day.offset}
            onPress={() => setDayOffset(day.offset)}
            style={[styles.dayChip, dayOffset === day.offset && styles.dayChipActive]}
          >
            <Text style={[styles.dayChipText, dayOffset === day.offset && styles.dayChipTextActive]}>
              {day.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.partyRow}>
        <Text style={styles.partyLabel}>Party size</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setPartySize((n) => Math.max(1, n - 1))} style={styles.stepperButton}>
            <Text style={styles.stepperButtonText}>–</Text>
          </Pressable>
          <Text style={styles.stepperValue}>{partySize}</Text>
          <Pressable onPress={() => setPartySize((n) => Math.min(20, n + 1))} style={styles.stepperButton}>
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      {isLoading && <ActivityIndicator color={colors.accent} style={styles.loading} />}

      {!isLoading && data && data.slots.every((s) => !s.available) && (
        <EmptyState title="No tables available" description="Try a different day or a smaller party." />
      )}

      {!isLoading && data && data.slots.some((s) => s.available) && (
        <View style={styles.slotGrid}>
          {data.slots
            .filter((slot) => slot.available)
            .map((slot) => (
              <Pressable
                key={slot.time}
                disabled={createReservation.isPending}
                onPress={() => bookSlot(slot.time)}
                style={styles.slotButton}
              >
                <Text style={styles.slotButtonText}>{formatSlotTime(slot.time, restaurant.timezone)}</Text>
              </Pressable>
            ))}
        </View>
      )}

      {createReservation.isError && (
        <Text style={styles.error}>Couldn't book that slot — please try another.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  dayRow: {
    gap: spacing.sm,
  },
  dayChip: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  dayChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  dayChipTextActive: {
    color: "#ffffff",
  },
  partyRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  partyLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  stepper: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stepperButton: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  stepperButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  stepperValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    minWidth: 20,
    textAlign: "center",
  },
  loading: {
    paddingVertical: spacing.xl,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  slotButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  slotButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});
