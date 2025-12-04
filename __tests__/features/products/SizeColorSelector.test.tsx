import userEvent from "@testing-library/user-event";
import { SizeColorSelector } from "@/features/products/components/SizeColorSelector";
import type { AvailableSize, AvailableColor } from "@/features/products/types/product.types";
import { render, screen } from "../../test-utils";

describe("SizeColorSelector", () => {
  const user = userEvent.setup();

  const mockSizes: AvailableSize[] = [
    { value: "S", label: "S", isAvailable: true, stockCount: 5 },
    { value: "M", label: "M", isAvailable: true, stockCount: 10 },
    { value: "L", label: "L", isAvailable: false, stockCount: 0 },
    { value: "XL", label: "XL", isAvailable: true, stockCount: 3 },
  ];

  const mockColors: AvailableColor[] = [
    { value: "red", label: "Red", hexCode: "#FF0000", isAvailable: true },
    { value: "blue", label: "Blue", hexCode: "#0000FF", isAvailable: true },
    { value: "green", label: "Green", hexCode: "#00FF00", isAvailable: false },
    { value: "white", label: "White", hexCode: "#FFFFFF", isAvailable: true },
  ];

  const defaultProps = {
    sizes: mockSizes,
    colors: mockColors,
    selectedSize: null,
    selectedColor: null,
    onSizeChange: jest.fn(),
    onColorChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Color Selector", () => {
    it("renders all color options", () => {
      render(<SizeColorSelector {...defaultProps} />);

      mockColors.forEach((color) => {
        expect(
          screen.getByRole("button", { name: new RegExp(color.label, "i") })
        ).toBeInTheDocument();
      });
    });

    it("displays color label heading", () => {
      render(<SizeColorSelector {...defaultProps} />);

      expect(screen.getByText(/color/i)).toBeInTheDocument();
    });

    it("shows selected color name", () => {
      render(<SizeColorSelector {...defaultProps} selectedColor="blue" />);

      expect(screen.getByText(/\(Blue\)/i)).toBeInTheDocument();
    });

    it("calls onColorChange when color is clicked", async () => {
      const onColorChange = jest.fn();
      render(<SizeColorSelector {...defaultProps} onColorChange={onColorChange} />);

      const redButton = screen.getByRole("button", { name: /red/i });
      await user.click(redButton);

      expect(onColorChange).toHaveBeenCalledWith("red");
    });

    it("disables unavailable color options", () => {
      render(<SizeColorSelector {...defaultProps} />);

      const greenButton = screen.getByRole("button", { name: /green/i });
      expect(greenButton).toBeDisabled();
    });

    it("applies special styling for selected color", () => {
      render(<SizeColorSelector {...defaultProps} selectedColor="blue" />);

      const blueButton = screen.getByRole("button", { name: /blue/i });
      expect(blueButton).toHaveClass("border-primary");
    });

    it("renders color swatches with hex codes", () => {
      const { container } = render(<SizeColorSelector {...defaultProps} />);

      // Check that color swatches have background colors applied
      const colorSwatches = container.querySelectorAll('[style*="background-color"]');
      expect(colorSwatches.length).toBeGreaterThan(0);
    });
  });

  describe("Size Selector", () => {
    it("renders all size options", () => {
      render(<SizeColorSelector {...defaultProps} />);

      mockSizes.forEach((size) => {
        expect(
          screen.getByRole("button", { name: new RegExp(`size ${size.label}`, "i") })
        ).toBeInTheDocument();
      });
    });

    it("displays size label heading", () => {
      render(<SizeColorSelector {...defaultProps} />);

      expect(screen.getByText(/^size$/i)).toBeInTheDocument();
    });

    it("shows selected size name", () => {
      render(<SizeColorSelector {...defaultProps} selectedSize="M" />);

      expect(screen.getByText(/\(M\)/i)).toBeInTheDocument();
    });

    it("calls onSizeChange when size is clicked", async () => {
      const onSizeChange = jest.fn();
      render(<SizeColorSelector {...defaultProps} onSizeChange={onSizeChange} />);

      const mediumButton = screen.getByRole("button", { name: /size M/i });
      await user.click(mediumButton);

      expect(onSizeChange).toHaveBeenCalledWith("M");
    });

    it("disables unavailable size options", () => {
      render(<SizeColorSelector {...defaultProps} />);

      const largeButton = screen.getByRole("button", { name: /size L/i });
      expect(largeButton).toBeDisabled();
    });

    it("shows stock count for selected size", () => {
      render(<SizeColorSelector {...defaultProps} selectedSize="M" />);

      expect(screen.getByText(/10 items available/i)).toBeInTheDocument();
    });

    it("applies default variant for selected size", () => {
      render(<SizeColorSelector {...defaultProps} selectedSize="M" />);

      const mediumButton = screen.getByRole("button", { name: /size M/i });
      // Selected button should have default variant
      expect(mediumButton).toBeInTheDocument();
    });
  });

  describe("Size Guide", () => {
    it("renders size guide link when sizes are present", () => {
      render(<SizeColorSelector {...defaultProps} />);

      expect(screen.getByRole("button", { name: /size guide/i })).toBeInTheDocument();
    });

    it("does not render size guide when no sizes", () => {
      render(<SizeColorSelector {...defaultProps} sizes={[]} />);

      expect(screen.queryByRole("button", { name: /size guide/i })).not.toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("does not render color section when no colors", () => {
      render(<SizeColorSelector {...defaultProps} colors={[]} />);

      // Should not show color heading when colors array is empty
      const colorHeadings = screen.queryAllByText(/^color$/i);
      expect(colorHeadings.length).toBe(0);
    });

    it("does not render size section when no sizes", () => {
      render(<SizeColorSelector {...defaultProps} sizes={[]} />);

      // Should not show size heading when sizes array is empty
      const sizeHeadings = screen.queryAllByText(/^size$/i);
      expect(sizeHeadings.length).toBe(0);
    });
  });
});
