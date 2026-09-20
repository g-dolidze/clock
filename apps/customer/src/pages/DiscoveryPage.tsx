import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState, Spinner } from "@ontime/web-shared";
import { useRestaurants } from "../hooks/useRestaurants";
import { RestaurantCard } from "../components/RestaurantCard";
import { MapView } from "../components/MapView";
import { isOpenNow } from "../lib/hours";

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
      <div>
        <h1 className="text-3xl font-black text-white">Find the table, skip the wait</h1>
        <p className="mt-1 text-white/60">
          Book ahead or order for pickup / dine-in, and walk straight to a seat that's ready.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants, cuisines..."
            className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#e3572c]"
          />
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={openNow}
            onChange={(e) => setOpenNow(e.target.checked)}
            className="h-4 w-4 accent-[#e3572c]"
          />
          Open now
        </label>
      </div>

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
