import userEvent from "@testing-library/user-event";
import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import type { ProductAvailabilityData } from "@/shared/lib/utils/product-availability";
import { render, screen, waitFor, mockProduct } from "../../test-utils";

// Mock the hooks
const mockAddItem = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock("@/features/cart/hooks", () => ({
  useCart: () => ({
    items: [],
  }),
  useAddToCart: () => ({
    mutate: mockAddItem,
    isPending: false,
  }),
  useUpdateQuantity: () => ({
    mutate: mockUpdateQuantity,
    isPending: false,
  }),
  useRemoveItem: () => ({
    mutate: mockRemoveItem,
    isPending: false,
  }),
}));

// Default availability data for tests
const defaultAvailability: ProductAvailabilityData = {
  isAvailable: true,
  isArchived: false,
  stock: 10,
};

describe("AddToCartButton", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders add to cart button", () => {
    render(<AddToCartButton productId="product-1" availability={defaultAvailability} />);

    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });

  it("calls addItem when clicked", async () => {
    render(<AddToCartButton productId="product-1" availability={defaultAvailability} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    await user.click(button);

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "product-1",
        quantity: 1,
      }),
      expect.any(Object)
    );
  });

  it("passes product name to addItem for toast messages", async () => {
    render(
      <AddToCartButton
        productId="product-1"
        productName="Test Product"
        availability={defaultAvailability}
      />
    );

    const button = screen.getByRole("button", { name: /add to cart/i });
    await user.click(button);

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productName: "Test Product",
      }),
      expect.any(Object)
    );
  });

  it("passes variant ID when provided", async () => {
    render(
      <AddToCartButton
        productId="product-1"
        variantId="variant-1"
        availability={defaultAvailability}
      />
    );

    const button = screen.getByRole("button", { name: /add to cart/i });
    await user.click(button);

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        variantId: "variant-1",
      }),
      expect.any(Object)
    );
  });

  it("is disabled when product is not available", () => {
    const unavailableProduct: ProductAvailabilityData = {
      isAvailable: false,
      isArchived: false,
      stock: 10,
    };

    render(<AddToCartButton productId="product-1" availability={unavailableProduct} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("is disabled when product is out of stock", () => {
    const outOfStockProduct: ProductAvailabilityData = {
      isAvailable: true,
      isArchived: false,
      stock: 0,
    };

    render(<AddToCartButton productId="product-1" availability={outOfStockProduct} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("renders quantity controls when showQuantityInput is true", () => {
    render(
      <AddToCartButton
        productId="product-1"
        showQuantityInput={true}
        availability={defaultAvailability}
      />
    );

    expect(screen.getByLabelText(/decrease quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/increase quantity/i)).toBeInTheDocument();
    const quantityInput = screen.getByRole("spinbutton", { name: /quantity/i });
    expect(quantityInput).toBeInTheDocument();
  });

  it("increments quantity when plus button is clicked", async () => {
    render(
      <AddToCartButton
        productId="product-1"
        showQuantityInput={true}
        availability={defaultAvailability}
      />
    );

    const incrementButton = screen.getByLabelText(/increase quantity/i);
    await user.click(incrementButton);

    const quantityInput = screen.getByRole("spinbutton", { name: /quantity/i });
    expect(quantityInput).toHaveValue(2);
  });

  it("decrements quantity when minus button is clicked", async () => {
    render(
      <AddToCartButton
        productId="product-1"
        showQuantityInput={true}
        defaultQuantity={3}
        availability={defaultAvailability}
      />
    );

    const decrementButton = screen.getByLabelText(/decrease quantity/i);
    await user.click(decrementButton);

    const quantityInput = screen.getByRole("spinbutton", { name: /quantity/i });
    expect(quantityInput).toHaveValue(2);
  });

  it("does not decrement below 1", async () => {
    render(
      <AddToCartButton
        productId="product-1"
        showQuantityInput={true}
        defaultQuantity={1}
        availability={defaultAvailability}
      />
    );

    const decrementButton = screen.getByLabelText(/decrease quantity/i);
    await user.click(decrementButton);

    const quantityInput = screen.getByRole("spinbutton", { name: /quantity/i });
    expect(quantityInput).toHaveValue(1);
  });

  it("applies custom className", () => {
    render(
      <AddToCartButton
        productId="product-1"
        className="custom-class"
        availability={defaultAvailability}
      />
    );

    const button = screen.getByRole("button", { name: /add to cart/i });
    expect(button).toHaveClass("custom-class");
  });

  it("uses custom size prop", () => {
    render(
      <AddToCartButton
        productId="product-1"
        size="lg"
        showQuantityInput={true}
        availability={defaultAvailability}
      />
    );

    // The button should render with the lg size
    const addButton = screen.getByRole("button", { name: /add to cart/i });
    expect(addButton).toBeInTheDocument();
  });

  it("uses custom variant prop", () => {
    render(
      <AddToCartButton
        productId="product-1"
        variant="outline"
        showQuantityInput={true}
        availability={defaultAvailability}
      />
    );

    const addButton = screen.getByRole("button", { name: /add to cart/i });
    expect(addButton).toBeInTheDocument();
  });
});
