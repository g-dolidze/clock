import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderStatusBadge } from "./StatusBadge";

describe("OrderStatusBadge", () => {
  it("renders the status text", () => {
    render(<OrderStatusBadge status="ready" />);
    expect(screen.getByText("ready")).toBeInTheDocument();
  });
});
