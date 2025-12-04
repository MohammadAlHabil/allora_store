import { WishlistIcon } from "@/features/wishlist/components/WishlistIcon";
import { render, screen } from "../../test-utils";

describe("WishlistIcon", () => {
  it("renders heart icon", () => {
    const { container } = render(<WishlistIcon isInWishlist={false} />);

    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
  });

  it("applies filled style when in wishlist", () => {
    const { container } = render(<WishlistIcon isInWishlist={true} />);

    const svgElement = container.querySelector("svg");
    expect(svgElement).toHaveClass("fill-red-500");
    expect(svgElement).toHaveClass("text-red-500");
  });

  it("applies unfilled style when not in wishlist", () => {
    const { container } = render(<WishlistIcon isInWishlist={false} />);

    const svgElement = container.querySelector("svg");
    expect(svgElement).toHaveClass("fill-none");
  });

  it("applies custom className", () => {
    const { container } = render(
      <WishlistIcon isInWishlist={false} className="custom-icon-class" />
    );

    const svgElement = container.querySelector("svg");
    expect(svgElement).toHaveClass("custom-icon-class");
  });

  it("renders with default size", () => {
    const { container } = render(<WishlistIcon isInWishlist={false} />);

    const svgElement = container.querySelector("svg");
    expect(svgElement).toHaveAttribute("width", "20");
    expect(svgElement).toHaveAttribute("height", "20");
  });

  it("renders with custom size", () => {
    const { container } = render(<WishlistIcon isInWishlist={false} size={24} />);

    const svgElement = container.querySelector("svg");
    expect(svgElement).toHaveAttribute("width", "24");
    expect(svgElement).toHaveAttribute("height", "24");
  });

  it("applies scale animation when in wishlist", () => {
    const { container } = render(<WishlistIcon isInWishlist={true} />);

    const svgElement = container.querySelector("svg");
    expect(svgElement).toHaveClass("scale-110");
  });

  it("applies transition classes for animation", () => {
    const { container } = render(<WishlistIcon isInWishlist={false} />);

    const svgElement = container.querySelector("svg");
    expect(svgElement).toHaveClass("transition-all");
    expect(svgElement).toHaveClass("duration-300");
    expect(svgElement).toHaveClass("ease-in-out");
  });
});
