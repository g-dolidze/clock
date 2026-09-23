import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImageCarousel } from "./ImageCarousel";

describe("ImageCarousel", () => {
  it("renders nothing for an empty image list", () => {
    const { container } = render(<ImageCarousel images={[]} alt="Empty" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("puts alt text on the first slide only", () => {
    const { container } = render(<ImageCarousel images={["/a.svg", "/b.svg"]} alt="Dining room" />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("alt", "Dining room");
    expect(images[1]).toHaveAttribute("alt", "");
  });

  it("caps rendered slides at 10 images", () => {
    const images = Array.from({ length: 15 }, (_, i) => `/${i}.svg`);
    const { container } = render(<ImageCarousel images={images} alt="Gallery" />);
    expect(container.querySelectorAll("img")).toHaveLength(10);
  });

  it("hides arrows and dots for a single image", () => {
    render(<ImageCarousel images={["/a.svg"]} alt="One" />);
    expect(screen.queryByLabelText("Next photo")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Show photo 1")).not.toBeInTheDocument();
  });

  it("clicking a dot switches the active slide", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<ImageCarousel images={["/a.svg", "/b.svg", "/c.svg"]} alt="Gallery" />);
    const secondDot = screen.getByLabelText("Show photo 2");
    await user.click(secondDot);
    expect(secondDot).toHaveAttribute("aria-current", "true");
  });
});
