import { fromZonedTime } from "date-fns-tz";
import type { AvailabilitySlot } from "@ontime/web-shared/server";
import type { Reservation, Restaurant, Table } from "@ontime/web-shared/server";

const SLOT_MINUTES = 30;
const HOLD_MINUTES = 90; // how long a booked table is considered occupied around its slot
const LAST_SEATING_BUFFER_MINUTES = 60; // stop offering slots this close to closing

function parseHm(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(":").map(Number);
  return { h, m };
}

export function buildAvailability(
  restaurant: Restaurant,
  tables: Table[],
  reservations: Reservation[],
  date: string,
  partySize: number,
): AvailabilitySlot[] {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const hours = restaurant.hours.find((h) => h.day === weekday);
  if (!hours) return [];

  const open = parseHm(hours.open);
  const close = parseHm(hours.close);
  const openMinutes = open.h * 60 + open.m;
  let closeMinutes = close.h * 60 + close.m;
  if (closeMinutes <= openMinutes) closeMinutes += 24 * 60; // overnight hours

  const eligibleTables = tables.filter((t) => t.capacity >= partySize);
  const activeReservations = reservations.filter(
    (r) => r.status !== "cancelled" && r.status !== "completed",
  );

  const slots: AvailabilitySlot[] = [];
  for (
    let minutes = openMinutes;
    minutes <= closeMinutes - LAST_SEATING_BUFFER_MINUTES;
    minutes += SLOT_MINUTES
  ) {
    const hh = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    const localDateTime = `${date}T${hh}:${mm}:00`;
    const instant = fromZonedTime(localDateTime, restaurant.timezone);
    const slotMs = instant.getTime();

    const available = eligibleTables.some((table) => {
      const tableReservations = activeReservations.filter((r) => r.tableId === table.id);
      return tableReservations.every((r) => {
        const resMs = new Date(r.time).getTime();
        return Math.abs(resMs - slotMs) >= HOLD_MINUTES * 60_000;
      });
    });

    slots.push({ time: instant.toISOString(), available });
  }

  return slots;
}

export function pickTableForReservation(
  tables: Table[],
  reservations: Reservation[],
  partySize: number,
  time: string,
): Table | undefined {
  const slotMs = new Date(time).getTime();
  const activeReservations = reservations.filter(
    (r) => r.status !== "cancelled" && r.status !== "completed",
  );
  const candidates = tables
    .filter((t) => t.capacity >= partySize)
    .sort((a, b) => a.capacity - b.capacity);

  return candidates.find((table) => {
    const tableReservations = activeReservations.filter((r) => r.tableId === table.id);
    return tableReservations.every((r) => {
      const resMs = new Date(r.time).getTime();
      return Math.abs(resMs - slotMs) >= HOLD_MINUTES * 60_000;
    });
  });
}
