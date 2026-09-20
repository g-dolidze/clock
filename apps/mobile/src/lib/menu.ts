import type { MenuItem } from "@ontime/web-shared/server";

export interface MenuSection {
  title: string;
  data: MenuItem[];
}

export function groupMenuByCategory(menu: MenuItem[]): MenuSection[] {
  const groups = new Map<string, MenuItem[]>();
  for (const item of menu) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  return [...groups.entries()].map(([title, data]) => ({ title, data }));
}
