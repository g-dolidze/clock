import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState, ImageCarousel, Spinner } from "@ontime/web-shared";
import { useRestaurants } from "../hooks/useRestaurants";
import { RestaurantCard } from "../components/RestaurantCard";
import { MapView } from "../components/MapView";
import { isOpenNow } from "../lib/hours";

const HERO_IMAGES = ["/photos/interior-1.svg", "/photos/interior-4.svg", "/photos/interior-2.svg", "/photos/interior-5.svg"];

function Hero({
  q,
  onQueryChange,
  openNow,
  onOpenNowChange,
}: {
  q: string;
  onQueryChange: (value: string) => void;
  openNow: boolean;
  onOpenNowChange: (value: boolean) => void;
}) {
  return (
    <section className="relative min-h-[380px] overflow-hidden rounded-3xl sm:min-h-[420px]">
      <div className="absolute inset-0">
        <ImageCarousel images={HERO_IMAGES} alt="" autoPlayMs={5000} showArrows={false} className="h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10" />

      <div className="relative flex min-h-[380px] flex-col justify-end gap-4 p-6 sm:min-h-[420px] sm:p-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              value={q}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search restaurants, cuisines..."
              role="search"
              className="w-full rounded-full border border-white/20 bg-black/40 py-3 pl-9 pr-4 text-sm text-white outline-none backdrop-blur-sm placeholder:text-white/50 focus:border-[#e3572c]"
            />
          </div>
          <label className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm">
            <input
              type="checkbox"
              checked={openNow}
              onChange={(e) => onOpenNowChange(e.target.checked)}
              className="h-4 w-4 accent-[#e3572c]"
            />
            Open now
          </label>
        </div>
      </div>
    </section>
  );
}

export function DiscoveryPage() {
  const [q, setQ] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const { data, isLoading, isError } = useRestaurants({ q: q || undefined });

  const restaurants = useMemo(() => {
    const list = data?.restaurants ?? [];
    return openNow ? list.filter((r) => isOpenNow(r)) : list;
  }, [data, openNow]);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    (data?.restaurants ?? []).forEach((r) => r.cuisine.forEach((c) => set.add(c)));
    return [...set].sort();
  }, [data]);

  return (
    <div className="space-y-6">
      <Hero q={q} onQueryChange={setQ} openNow={openNow} onOpenNowChange={setOpenNow} />

      {cuisines.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-white/50">
          {cuisines.map((c) => (
            <span key={c} className="rounded-full border border-white/10 px-2.5 py-1">
              {c}
            </span>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && (
        <EmptyState title="Couldn't load restaurants" description="Check your connection and try again." />
      )}

      {!isLoading && !isError && restaurants.length === 0 && (
        <EmptyState title="No restaurants match" description="Try a different search or clear filters." />
      )}

      {!isLoading && restaurants.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-4 sm:grid-cols-2">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} onMouseEnter={() => setSelectedId(restaurant.id)}>
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
          <div className="hidden h-[520px] overflow-hidden rounded-2xl border border-white/10 lg:block lg:sticky lg:top-20">
            <MapView restaurants={restaurants} selectedId={selectedId} onSelect={setSelectedId} className="h-full" />
          </div>
        </div>
      )}
    </div>
  );
}
