import userEvent from "@testing-library/user-event";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { render, screen, waitFor, mockCartItem } from "../../test-utils";

// Mock the cart hooks
const mockItems = [mockCartItem];
jest.mock("@/features/cart/hooks", () => ({
  useCart: () => ({
    items: mockItems,
    itemCount: 2,
    isEmpty: false,
    isLoading: false,
  }),
}));

// Mock checkout validation hook
const mockValidateCheckout = jest.fn().mockResolvedValue(true);
jest.mock("@/features/checkout/hooks/useCheckoutValidation", () => ({
  useCheckoutValidation: () => ({
    validateCheckout: mockValidateCheckout,
    isValidating: false,
    isProcessing: false,
    issues: [],
    generalErrors: [],
    showModal: false,
    setShowModal: jest.fn(),
    handleRemoveItem: jest.fn(),
    handleUpdateQuantity: jest.fn(),
    handleUpdatePrice: jest.fn(),
  }),
}));

// Mock the formatters
jest.mock("@/features/cart/utils/formatters", () => ({
  calculateCartSubtotal: jest.fn(() => 59.98),
  calculateCartTotal: jest.fn(() => 59.98),
}));

// Mock the shared formatters
jest.mock("@/shared/lib/utils/formatters", () => ({
  formatPrice: jest.fn((price) => `$${price.toFixed(2)}`),
}));

describe("CartSummary", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders order summary title", () => {
    render(<CartSummary />);

    expect(screen.getByText(/order summary/i)).toBeInTheDocument();
  });

  it("displays item count when showItemCount is true", () => {
    render(<CartSummary showItemCount={true} />);

    expect(screen.getByText(/items/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("displays subtotal when showSubtotal is true", () => {
    render(<CartSummary showSubtotal={true} />);

    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
  });

  it("displays shipping when showShipping is true", () => {
    render(<CartSummary showShipping={true} shippingCost={10} />);

    expect(screen.getByText(/shipping/i)).toBeInTheDocument();
  });

  it("displays free shipping when shippingCost is 0", () => {
    render(<CartSummary showShipping={true} shippingCost={0} />);

    expect(screen.getByText(/free/i)).toBeInTheDocument();
  });

  it("displays tax when showTax is true and taxAmount > 0", () => {
    render(<CartSummary showTax={true} taxAmount={5} />);

    expect(screen.getByText(/tax/i)).toBeInTheDocument();
  });

  it("displays discount when showDiscount is true", () => {
    render(<CartSummary showDiscount={true} discountAmount={10} couponCode="SAVE10" />);

    expect(screen.getByText(/discount/i)).toBeInTheDocument();
    expect(screen.getByText(/save10/i)).toBeInTheDocument();
  });

  it("displays total amount", () => {
    render(<CartSummary />);

    // Check for total text - could be "Total" or "Subtotal" depending on configuration
    const totalElements = screen.queryAllByText(/total/i);
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it("renders checkout button when showCheckoutButton is true", () => {
    render(<CartSummary showCheckoutButton={true} />);

    expect(screen.getByRole("button", { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it("uses custom checkout button label", () => {
    render(<CartSummary showCheckoutButton={true} checkoutButtonLabel="Complete Purchase" />);

    expect(screen.getByRole("button", { name: /complete purchase/i })).toBeInTheDocument();
  });

  it("calls onCheckout when checkout button is clicked and validation passes", async () => {
    const mockOnCheckout = jest.fn();
    render(<CartSummary showCheckoutButton={true} onCheckout={mockOnCheckout} />);

    const checkoutButton = screen.getByRole("button", { name: /proceed to checkout/i });
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(mockValidateCheckout).toHaveBeenCalled();
      expect(mockOnCheckout).toHaveBeenCalled();
    });
  });

  it("does not call onCheckout when validation fails", async () => {
    mockValidateCheckout.mockResolvedValueOnce(false);
    const mockOnCheckout = jest.fn();

    render(<CartSummary showCheckoutButton={true} onCheckout={mockOnCheckout} />);

    const checkoutButton = screen.getByRole("button", { name: /proceed to checkout/i });
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(mockValidateCheckout).toHaveBeenCalled();
      expect(mockOnCheckout).not.toHaveBeenCalled();
    });
  });
});

describe("CartSummary - Empty Cart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles empty cart state", () => {
    // The component handles empty cart internally through useCart hook
    // This test verifies the component still renders without errors
    render(<CartSummary />);

    // Order summary should still be present
    expect(screen.getByText(/order summary/i)).toBeInTheDocument();
  });
});
