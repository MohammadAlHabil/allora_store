import userEvent from "@testing-library/user-event";
import { ProductInfo } from "@/features/products/components/ProductInfo";
import { render, screen, waitFor, mockProduct } from "../../test-utils";

// Mock the cart hook
const mockAddItem = jest.fn();
jest.mock("@/features/cart/hooks/useCart", () => ({
  useCart: () => ({
    addItem: mockAddItem,
    isAdding: false,
  }),
}));

// Mock express checkout hook
jest.mock("@/features/checkout/hooks/useExpressCheckout", () => ({
  useExpressCheckout: () => ({
    setExpressItem: jest.fn(),
  }),
}));

// Mock wishlist hooks
jest.mock("@/features/wishlist/hooks/useWishlist", () => ({
  useWishlist: () => ({
    data: { items: [] },
  }),
  useToggleWishlist: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

// Mock product utils
jest.mock("@/features/products/utils/product.utils", () => ({
  findMatchingVariant: jest.fn(() => ({
    id: "variant-1",
    sku: "VAR-001",
    price: 29.99,
    stock: 10,
    isDefault: true,
    optionValues: { size: "M", color: "Blue" },
  })),
  formatPrice: jest.fn((price, currency) => `$${price.toFixed(2)}`),
  getAvailableColors: jest.fn(() => [
    { value: "blue", label: "Blue", hexCode: "#0000FF", isAvailable: true },
    { value: "red", label: "Red", hexCode: "#FF0000", isAvailable: true },
  ]),
  getAvailableColorsForSize: jest.fn(() => [
    { value: "blue", label: "Blue", hexCode: "#0000FF", isAvailable: true },
  ]),
  getAvailableSizes: jest.fn(() => [
    { value: "M", label: "M", isAvailable: true, stockCount: 10 },
    { value: "L", label: "L", isAvailable: true, stockCount: 5 },
  ]),
  getAvailableSizesForColor: jest.fn(() => [
    { value: "M", label: "M", isAvailable: true, stockCount: 10 },
  ]),
  getAvailableQuantity: jest.fn(() => 10),
  getPriceInfo: jest.fn(() => ({
    current: 29.99,
    original: 39.99,
    discountPercentage: 25,
  })),
  getStockStatus: jest.fn(() => "in_stock"),
  getStockStatusMessage: jest.fn(() => "In Stock"),
  isValidSelection: jest.fn(() => true),
  validateSelection: jest.fn(() => ({ isValid: true })),
}));

describe("ProductInfo", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders product name", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByRole("heading", { name: mockProduct.name })).toBeInTheDocument();
  });

  it("renders product short description", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByText(mockProduct.shortDesc)).toBeInTheDocument();
  });

  it("renders product rating and review count", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText(/100 reviews/i)).toBeInTheDocument();
  });

  it("renders stock status badge", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByText(/in stock/i)).toBeInTheDocument();
  });

  it("renders current price", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByText("$29.99")).toBeInTheDocument();
  });

  it("renders original price with discount", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByText("$39.99")).toBeInTheDocument();
    expect(screen.getByText(/save 25%/i)).toBeInTheDocument();
  });

  it("renders Add to Cart button", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });

  it("renders Buy Now button", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByRole("button", { name: /buy now/i })).toBeInTheDocument();
  });

  it("renders wishlist button", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByRole("button", { name: /wishlist/i })).toBeInTheDocument();
  });

  it("renders share button", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("calls addItem when Add to Cart is clicked", async () => {
    render(<ProductInfo product={mockProduct as any} />);

    const addButton = screen.getByRole("button", { name: /add to cart/i });
    await user.click(addButton);

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: mockProduct.id,
        productName: mockProduct.name,
      })
    );
  });

  it("renders SKU information", () => {
    render(<ProductInfo product={mockProduct as any} />);

    // SKU may be displayed in different formats
    const skuElements = screen.queryAllByText(/sku|TEST-SKU-001/i);
    expect(skuElements.length).toBeGreaterThan(0);
  });

  it("renders category information", () => {
    render(<ProductInfo product={mockProduct as any} />);

    // Category info may be rendered in links or badges
    const categoryElements = screen.queryAllByText(/test category|category/i);
    expect(categoryElements.length).toBeGreaterThan(0);
  });

  it("renders product type", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByText(/product type/i)).toBeInTheDocument();
    expect(screen.getByText(/physical/i)).toBeInTheDocument();
  });

  it("renders shipping info for physical products", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByText(/free shipping/i)).toBeInTheDocument();
    expect(screen.getByText(/orders over \$100/i)).toBeInTheDocument();
  });

  it("renders tax information", () => {
    render(<ProductInfo product={mockProduct as any} />);

    expect(screen.getByText(/tax included/i)).toBeInTheDocument();
  });
});
