import userEvent from "@testing-library/user-event";
import { CartItem } from "@/features/cart/components/CartItem";
import { render, screen, mockCartItem } from "../../test-utils";

// Mock the cart hooks
const mockUpdateQuantity = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock("@/features/cart/hooks", () => ({
  useUpdateQuantity: () => ({
    mutate: mockUpdateQuantity,
    isPending: false,
  }),
  useRemoveItem: () => ({
    mutate: mockRemoveItem,
    isPending: false,
  }),
}));

describe("CartItem", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders cart item with title and sku", () => {
    render(<CartItem item={mockCartItem} />);

    expect(screen.getByText(mockCartItem.title)).toBeInTheDocument();
    expect(screen.getByText(`SKU: ${mockCartItem.sku}`)).toBeInTheDocument();
  });

  it("renders quantity controls", () => {
    render(<CartItem item={mockCartItem} />);

    expect(screen.getByLabelText(/decrease quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/increase quantity/i)).toBeInTheDocument();
    const quantityInput = screen.getByRole("spinbutton", { name: /quantity/i });
    expect(quantityInput).toHaveValue(mockCartItem.quantity);
  });

  it("renders remove button when showRemoveButton is true", () => {
    render(<CartItem item={mockCartItem} showRemoveButton={true} />);

    expect(screen.getByLabelText(/remove item/i)).toBeInTheDocument();
  });

  it("does not render remove button when showRemoveButton is false", () => {
    render(<CartItem item={mockCartItem} showRemoveButton={false} />);

    expect(screen.queryByLabelText(/remove item/i)).not.toBeInTheDocument();
  });

  it("renders image when showImage is true", () => {
    render(<CartItem item={mockCartItem} showImage={true} imageUrl="/images/test.jpg" />);

    expect(screen.getByAltText(mockCartItem.title)).toBeInTheDocument();
  });

  it("does not render image when showImage is false", () => {
    render(<CartItem item={mockCartItem} showImage={false} />);

    expect(screen.queryByAltText(mockCartItem.title)).not.toBeInTheDocument();
  });

  it("calls updateQuantity when increment button is clicked", async () => {
    render(<CartItem item={mockCartItem} />);

    const incrementButton = screen.getByLabelText(/increase quantity/i);
    await user.click(incrementButton);

    expect(mockUpdateQuantity).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: mockCartItem.id,
        input: { quantity: mockCartItem.quantity + 1 },
      }),
      expect.any(Object)
    );
  });

  it("calls updateQuantity when decrement button is clicked", async () => {
    render(<CartItem item={mockCartItem} />);

    const decrementButton = screen.getByLabelText(/decrease quantity/i);
    await user.click(decrementButton);

    expect(mockUpdateQuantity).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: mockCartItem.id,
        input: { quantity: mockCartItem.quantity - 1 },
      }),
      expect.any(Object)
    );
  });

  it("disables decrement button when quantity is 1", () => {
    const itemWithQuantity1 = { ...mockCartItem, quantity: 1 };
    render(<CartItem item={itemWithQuantity1} />);

    const decrementButton = screen.getByLabelText(/decrease quantity/i);
    // Button should be disabled at quantity 1
    expect(decrementButton).toBeDisabled();
  });

  it("calls removeItem when remove button is clicked", async () => {
    render(<CartItem item={mockCartItem} showRemoveButton={true} />);

    const removeButton = screen.getByLabelText(/remove item/i);
    await user.click(removeButton);

    expect(mockRemoveItem).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: mockCartItem.id,
      })
    );
  });

  it("updates quantity when input value changes", async () => {
    render(<CartItem item={mockCartItem} />);

    const quantityInput = screen.getByRole("spinbutton", { name: /quantity/i });
    await user.clear(quantityInput);
    await user.type(quantityInput, "5");

    expect(mockUpdateQuantity).toHaveBeenCalled();
  });

  it("displays product link", () => {
    render(<CartItem item={mockCartItem} />);

    const productLinks = screen.getAllByRole("link");
    expect(productLinks[0]).toHaveAttribute("href", `/products/${mockCartItem.slug}`);
  });

  it("displays variant ID when present", () => {
    const itemWithVariant = { ...mockCartItem, variantId: "variant-123" };
    render(<CartItem item={itemWithVariant} />);

    expect(screen.getByText(/variant: variant-123/i)).toBeInTheDocument();
  });
});
