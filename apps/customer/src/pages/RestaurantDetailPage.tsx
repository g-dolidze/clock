import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { Button, Card, EmptyState, ImageCarousel, Spinner, priceRangeLabel } from "@ontime/web-shared";
import { useRestaurant } from "../hooks/useRestaurants";
import { MenuList } from "../components/MenuList";
import { ReservationBooker } from "../components/ReservationBooker";
import { RestaurantMap } from "../components/RestaurantMap";
import { isOpenNow, todaysHoursLabel } from "../lib/hours";
import { useCartStore } from "../store/cartStore";

type Tab = "menu" | "reserve";

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useRestaurant(id);
  const [tab, setTab] = useState<Tab>("menu");
  const cartCount = useCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return <EmptyState title="Restaurant not found" description="It may have been removed." />;
  }

  const { restaurant, menu, tables } = data;
  const open = isOpenNow(restaurant);
  const freeTables = tables.filter((t) => t.status === "free").length;
  const galleryImages = restaurant.imageUrls.length > 0 ? restaurant.imageUrls : [restaurant.heroImageUrl];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr_220px]">
        <ImageCarousel
          images={galleryImages}
          alt={restaurant.name}
          className="aspect-square w-full rounded-3xl lg:aspect-auto lg:h-full lg:min-h-[260px]"
        />

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine.map((c) => (
              <span key={c} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">
                {c}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-black text-white">{restaurant.name}</h1>
          <span className="flex w-fit items-center gap-1 text-sm text-white/60">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {restaurant.rating.toFixed(1)}
          </span>
          <p className="max-w-2xl text-white/60">{restaurant.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {restaurant.address}
            </span>
            <span className="font-mono-accent">{priceRangeLabel(restaurant.priceRange)}</span>
            <span>{todaysHoursLabel(restaurant)}</span>
          </div>
          <p className={open ? "text-sm font-semibold text-emerald-400" : "text-sm font-semibold text-white/50"}>
            {open ? "Open now" : "Closed now"} · {freeTables} of {tables.length} tables free right now
          </p>
          <Button variant="primary" onClick={() => setTab("reserve")}>
            Reserve a table
          </Button>
        </div>

        <RestaurantMap
          lat={restaurant.location.lat}
          lng={restaurant.location.lng}
          name={restaurant.name}
          className="mx-auto w-full max-w-[220px] lg:mx-0 lg:self-start"
        />
      </div>

      <div className="flex gap-2 border-b border-white/10">
        <button
          type="button"
          onClick={() => setTab("menu")}
          className={`px-4 py-2 text-sm font-semibold ${tab === "menu" ? "border-b-2 border-[#e3572c] text-white" : "text-white/50"}`}
        >
          Order ahead
        </button>
        <button
          type="button"
          onClick={() => setTab("reserve")}
          className={`px-4 py-2 text-sm font-semibold ${tab === "reserve" ? "border-b-2 border-[#e3572c] text-white" : "text-white/50"}`}
        >
          Reserve a table
        </button>
      </div>

      {tab === "menu" && (
        <div className="space-y-4">
          <MenuList restaurantId={restaurant.id} menu={menu} />
          {cartCount > 0 && (
            <Card className="sticky bottom-4 flex items-center justify-between p-4">
              <span className="text-sm text-white/70">{cartCount} item(s) in your cart</span>
              <Link to="/checkout" className="text-sm font-semibold text-[#e3572c] hover:underline">
                Go to checkout →
              </Link>
            </Card>
          )}
        </div>
      )}

      {tab === "reserve" && <ReservationBooker restaurant={restaurant} />}
    </div>
  );
}
