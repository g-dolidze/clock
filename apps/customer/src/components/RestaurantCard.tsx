import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Card, priceRangeLabel, type Restaurant } from "@ontime/web-shared";
import { isOpenNow } from "../lib/hours";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const open = isOpenNow(restaurant);
  return (
    <Link to={`/restaurants/${restaurant.id}`}>
      <Card className="group overflow-hidden transition-colors hover:border-white/25">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <img
            src={restaurant.heroImageUrl}
            alt={restaurant.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
              open ? "bg-emerald-500/90 text-white" : "bg-black/60 text-white/70"
            }`}
          >
            {open ? "Open now" : "Closed"}
          </span>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-white">{restaurant.name}</h3>
            <span className="flex shrink-0 items-center gap-1 text-sm text-white/70">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {restaurant.rating.toFixed(1)}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-white/60">{restaurant.description}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-white/50">
            <span>{restaurant.cuisine.join(" · ")}</span>
            <span aria-hidden>•</span>
            <span className="font-mono-accent">{priceRangeLabel(restaurant.priceRange)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <MapPin className="h-3 w-3" />
            {restaurant.address}
          </div>
        </div>
      </Card>
    </Link>
  );
}
