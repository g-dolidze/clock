import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TableStatusBadge } from "./StatusBadge";

describe("TableStatusBadge", () => {
  it("renders the table status", () => {
    render(<TableStatusBadge status="occupied" />);
    expect(screen.getByText("occupied")).toBeInTheDocument();
  });
});
