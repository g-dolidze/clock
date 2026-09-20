import { describe, expect, it } from "vitest";
import { formatCents, priceRangeLabel } from "./format";

describe("formatCents", () => {
  it("formats whole dollar amounts", () => {
    expect(formatCents(1200)).toBe("$12.00");
  });

  it("formats fractional cents", () => {
    expect(formatCents(1299)).toBe("$12.99");
  });

  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });
});

describe("priceRangeLabel", () => {
  it("repeats $ for the given range", () => {
    expect(priceRangeLabel(1)).toBe("$");
    expect(priceRangeLabel(4)).toBe("$$$$");
  });
});
