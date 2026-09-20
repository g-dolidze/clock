import { toZonedTime } from "date-fns-tz";
import type { Restaurant } from "@ontime/web-shared";

export function isOpenNow(restaurant: Restaurant, now = new Date()): boolean {
  const local = toZonedTime(now, restaurant.timezone);
  const weekday = local.getDay();
  const hours = restaurant.hours.find((h) => h.day === weekday);
  if (!hours) return false;

  const minutes = local.getHours() * 60 + local.getMinutes();
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;
  if (closeMinutes <= openMinutes) closeMinutes += 24 * 60;

  return minutes >= openMinutes && minutes < closeMinutes;
}

export function todaysHoursLabel(restaurant: Restaurant, now = new Date()): string {
  const local = toZonedTime(now, restaurant.timezone);
  const hours = restaurant.hours.find((h) => h.day === local.getDay());
  if (!hours) return "Closed today";
  return `${hours.open} – ${hours.close}`;
}
