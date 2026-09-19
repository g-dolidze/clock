import { describe, expect, it } from "vitest";
import type { Restaurant } from "@ontime/web-shared";
import { isOpenNow } from "./hours";

const restaurant: Restaurant = {
  id: "rst_1",
  slug: "test",
  name: "Test Restaurant",
  description: "",
  cuisine: [],
  priceRange: 2,
  rating: 4.5,
  address: "",
  location: { lat: 0, lng: 0 },
  heroImageUrl: "",
  timezone: "UTC",
  hours: [{ day: 3, open: "11:00", close: "22:00" }], // Wednesday
};

describe("isOpenNow", () => {
  it("is open within hours on the matching weekday", () => {
    const wednesdayNoonUtc = new Date("2024-01-03T12:00:00Z"); // a Wednesday
    expect(isOpenNow(restaurant, wednesdayNoonUtc)).toBe(true);
  });

  it("is closed outside hours", () => {
    const wednesdayLateUtc = new Date("2024-01-03T23:30:00Z");
    expect(isOpenNow(restaurant, wednesdayLateUtc)).toBe(false);
  });

  it("is closed on a day with no hours entry", () => {
    const thursdayNoonUtc = new Date("2024-01-04T12:00:00Z");
    expect(isOpenNow(restaurant, thursdayNoonUtc)).toBe(false);
  });
});
