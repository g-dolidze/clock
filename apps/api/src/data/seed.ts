import { nanoid } from "nanoid";
import type { MenuItem, Restaurant, Table } from "@ontime/web-shared/server";
import { store } from "./store";

function id(prefix: string): string {
  return `${prefix}_${nanoid(10)}`;
}

const DAILY_HOURS = (open: string, close: string) =>
  Array.from({ length: 7 }, (_, day) => ({ day, open, close }));

// Local gradient placeholders instead of a CDN — no external network
// dependency for images, and no risk of them failing to load in a
// sandboxed/offline dev environment (see apps/customer/public/photos and
// the redesign TDD this mirrors). Each restaurant gets a deterministic,
// rotating 4-of-6 slice so galleries don't all look identical.
const PHOTO_COUNT = 6;
function interiorPhotos(offset: number, count = 4): string[] {
  return Array.from({ length: count }, (_, i) => `/photos/interior-${((offset + i) % PHOTO_COUNT) + 1}.svg`);
}

const RESTAURANT_SEEDS: Array<
  Omit<Restaurant, "id" | "heroImageUrl" | "imageUrls"> & {
    imageUrls: string[];
    menu: Array<Omit<MenuItem, "id" | "restaurantId">>;
  }
> = [
  {
    slug: "tbilisi-grill-house",
    name: "Tbilisi Grill House",
    description: "Wood-fired khinkali, mtsvadi skewers and a cellar of Saperavi.",
    cuisine: ["Georgian", "Grill"],
    priceRange: 2,
    rating: 4.7,
    address: "12 Rustaveli Ave, Tbilisi",
    location: { lat: 41.6977, lng: 44.7999 },
    imageUrls: interiorPhotos(0),
    hours: DAILY_HOURS("11:00", "23:00"),
    timezone: "Asia/Tbilisi",
    menu: [
      { name: "Khinkali (5pc)", description: "Hand-folded pork & beef dumplings", category: "Starters", priceCents: 900, available: true },
      { name: "Mtsvadi Skewer", description: "Charcoal-grilled pork skewer", category: "Mains", priceCents: 1400, available: true },
      { name: "Khachapuri Adjaruli", description: "Boat-shaped cheese bread with egg", category: "Mains", priceCents: 1200, available: true },
      { name: "Lobio", description: "Slow-cooked kidney bean stew", category: "Mains", priceCents: 900, available: true },
      { name: "Churchkhela", description: "Walnut & grape must candy", category: "Dessert", priceCents: 500, available: true },
    ],
  },
  {
    slug: "sea-and-salt",
    name: "Sea & Salt",
    description: "Black Sea seafood, minimalist plating, Batumi waterfront views.",
    cuisine: ["Seafood", "Mediterranean"],
    priceRange: 3,
    rating: 4.5,
    address: "4 Rustaveli St, Batumi",
    location: { lat: 41.6461, lng: 41.6367 },
    imageUrls: interiorPhotos(2),
    hours: DAILY_HOURS("12:00", "23:30"),
    timezone: "Asia/Tbilisi",
    menu: [
      { name: "Grilled Sea Bass", description: "Whole fish, lemon, olive oil", category: "Mains", priceCents: 2600, available: true },
      { name: "Mussels Saganaki", description: "Tomato, feta, ouzo", category: "Starters", priceCents: 1500, available: true },
      { name: "Octopus Carpaccio", description: "Thin-sliced, chili oil", category: "Starters", priceCents: 1800, available: true },
      { name: "Seafood Risotto", description: "Prawns, squid, saffron", category: "Mains", priceCents: 2200, available: true },
      { name: "Baklava", description: "Walnut, honey syrup", category: "Dessert", priceCents: 700, available: false },
    ],
  },
  {
    slug: "vine-and-rye",
    name: "Vine & Rye",
    description: "Natural wine bar with a small-plates kitchen in old Kutaisi.",
    cuisine: ["Wine Bar", "Small Plates"],
    priceRange: 2,
    rating: 4.6,
    address: "8 Tsereteli St, Kutaisi",
    location: { lat: 42.2679, lng: 42.6946 },
    imageUrls: interiorPhotos(4),
    hours: DAILY_HOURS("16:00", "01:00"),
    timezone: "Asia/Tbilisi",
    menu: [
      { name: "Cheese & Charcuterie Board", description: "Local cheeses, cured meats", category: "Starters", priceCents: 2400, available: true },
      { name: "Roasted Beet Salad", description: "Walnut, pomegranate, herbs", category: "Starters", priceCents: 1100, available: true },
      { name: "Duck Confit", description: "Crispy leg, orange glaze", category: "Mains", priceCents: 2300, available: true },
      { name: "Amber Wine Flight", description: "3 pours, qvevri-aged", category: "Drinks", priceCents: 1800, available: true },
    ],
  },
];

export function seed() {
  store.customers.clear();
  store.tokens.clear();
  store.restaurants.clear();
  store.menuItems.clear();
  store.tables.clear();
  store.orders.clear();
  store.reservations.clear();
  store.payments.clear();

  for (const seedRestaurant of RESTAURANT_SEEDS) {
    const { menu, imageUrls, ...rest } = seedRestaurant;
    const restaurantId = id("rst");
    const restaurant: Restaurant = { id: restaurantId, imageUrls, heroImageUrl: imageUrls[0], ...rest };
    store.restaurants.set(restaurantId, restaurant);

    for (const item of menu) {
      const menuItemId = id("mnu");
      store.menuItems.set(menuItemId, { id: menuItemId, restaurantId, ...item });
    }

    const tableLayout = [2, 2, 4, 4, 6];
    tableLayout.forEach((capacity, index) => {
      const tableId = id("tbl");
      const table: Table = {
        id: tableId,
        restaurantId,
        label: `T${index + 1}`,
        capacity,
        status: "free",
      };
      store.tables.set(tableId, table);
    });
  }
}
