import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "@ontime/web-shared";
import type { RestaurantListResponse } from "@ontime/web-shared";
import { api } from "../lib/api";
import { useSessionStore } from "../store/sessionStore";

export function SetupPage() {
  const setSession = useSessionStore((s) => s.setSession);
  const [adminKey, setAdminKey] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["setup", "restaurants"],
    queryFn: () => api.get<RestaurantListResponse>("/v1/restaurants"),
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const restaurant = data?.restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) {
      setError("Choose a restaurant.");
      return;
    }
    // Confirm the key actually works before entering the dashboard.
    const res = await fetch(`/v1/restaurant/${restaurant.id}/tables`, {
      headers: { "x-admin-key": adminKey },
    });
    if (!res.ok) {
      setError("That admin key was rejected.");
      return;
    }
    setError(null);
    setSession(adminKey, restaurant.id, restaurant.name);
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-2 text-2xl font-black text-white">ontime.ge for restaurants</h1>
      <p className="mb-6 text-sm text-white/60">
        Sign in with your admin key to manage orders, reservations and tables in real time.
      </p>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="restaurant" className="mb-1 block text-sm font-medium text-white/80">
              Restaurant
            </label>
            <select
              id="restaurant"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#e3572c]"
            >
              <option value="">{isLoading ? "Loading…" : "Select a restaurant"}</option>
              {data?.restaurants.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#211714]">
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="admin-key" className="mb-1 block text-sm font-medium text-white/80">
              Admin key
            </label>
            <input
              id="admin-key"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="dev-admin-key"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#e3572c]"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full">
            Enter dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
}
