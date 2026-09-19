import { useMemo } from "react";
import { Plus } from "lucide-react";
import { formatCents, type MenuItem } from "@ontime/web-shared";
import { useCartStore } from "../store/cartStore";

export function MenuList({ restaurantId, menu }: { restaurantId: string; menu: MenuItem[] }) {
  const addItem = useCartStore((s) => s.addItem);

  const byCategory = useMemo(() => {
    const groups = new Map<string, MenuItem[]>();
    for (const item of menu) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return [...groups.entries()];
  }, [menu]);

  return (
    <div className="space-y-6">
      {byCategory.map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/50">{category}</h3>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                  <p className="truncate text-xs text-white/50">{item.description}</p>
                  <p className="mt-1 font-mono-accent text-sm text-white/80">{formatCents(item.priceCents)}</p>
                </div>
                <button
                  type="button"
                  disabled={!item.available}
                  onClick={() =>
                    addItem(restaurantId, {
                      menuItemId: item.id,
                      name: item.name,
                      priceCents: item.priceCents,
                    })
                  }
                  className="flex shrink-0 items-center gap-1 rounded-full bg-[#e3572c] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#c9481f] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {item.available ? "Add" : "Sold out"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
