import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrderStatusBadge, ReservationStatusBadge } from "./StatusBadge";

describe("OrderStatusBadge", () => {
  it("renders the status text", () => {
    render(<OrderStatusBadge status="preparing" />);
    expect(screen.getByText("preparing")).toBeInTheDocument();
  });
});

describe("ReservationStatusBadge", () => {
  it("renders the status text", () => {
    render(<ReservationStatusBadge status="confirmed" />);
    expect(screen.getByText("confirmed")).toBeInTheDocument();
  });
});
