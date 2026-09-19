export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function priceRangeLabel(range: 1 | 2 | 3 | 4): string {
  return "$".repeat(range);
}
