import userEvent from "@testing-library/user-event";
import { QuantitySelector } from "@/features/products/components/QuantitySelector";
import { render, screen } from "../../test-utils";

describe("QuantitySelector", () => {
  const user = userEvent.setup();
  const defaultProps = {
    quantity: 1,
    maxQuantity: 10,
    onQuantityChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders quantity input with current value", () => {
    render(<QuantitySelector {...defaultProps} quantity={5} />);

    const input = screen.getByRole("spinbutton", { name: /quantity/i });
    expect(input).toHaveValue(5);
  });

  it("renders increment and decrement buttons", () => {
    render(<QuantitySelector {...defaultProps} />);

    expect(screen.getByLabelText(/decrease quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/increase quantity/i)).toBeInTheDocument();
  });

  it("displays available quantity", () => {
    render(<QuantitySelector {...defaultProps} maxQuantity={15} />);

    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText(/available/i)).toBeInTheDocument();
  });

  it("calls onQuantityChange with incremented value when plus is clicked", async () => {
    const onQuantityChange = jest.fn();
    render(<QuantitySelector {...defaultProps} quantity={3} onQuantityChange={onQuantityChange} />);

    const incrementButton = screen.getByLabelText(/increase quantity/i);
    await user.click(incrementButton);

    expect(onQuantityChange).toHaveBeenCalledWith(4);
  });

  it("calls onQuantityChange with decremented value when minus is clicked", async () => {
    const onQuantityChange = jest.fn();
    render(<QuantitySelector {...defaultProps} quantity={3} onQuantityChange={onQuantityChange} />);

    const decrementButton = screen.getByLabelText(/decrease quantity/i);
    await user.click(decrementButton);

    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it("disables decrement button when quantity is 1", () => {
    render(<QuantitySelector {...defaultProps} quantity={1} />);

    const decrementButton = screen.getByLabelText(/decrease quantity/i);
    expect(decrementButton).toBeDisabled();
  });

  it("disables increment button when quantity equals maxQuantity", () => {
    render(<QuantitySelector {...defaultProps} quantity={10} maxQuantity={10} />);

    const incrementButton = screen.getByLabelText(/increase quantity/i);
    expect(incrementButton).toBeDisabled();
  });

  it("disables all controls when disabled prop is true", () => {
    render(<QuantitySelector {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText(/decrease quantity/i)).toBeDisabled();
    expect(screen.getByLabelText(/increase quantity/i)).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: /quantity/i })).toBeDisabled();
  });

  it("handles input change correctly", async () => {
    const onQuantityChange = jest.fn();
    render(<QuantitySelector {...defaultProps} onQuantityChange={onQuantityChange} />);

    const input = screen.getByRole("spinbutton", { name: /quantity/i });
    await user.clear(input);
    await user.type(input, "5");

    // The component may call onQuantityChange multiple times during typing
    expect(onQuantityChange).toHaveBeenCalled();
  });

  it("clamps value to 1 when input is less than 1", async () => {
    const onQuantityChange = jest.fn();
    render(<QuantitySelector {...defaultProps} onQuantityChange={onQuantityChange} />);

    const input = screen.getByRole("spinbutton", { name: /quantity/i });
    await user.clear(input);
    await user.type(input, "0");

    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });

  it("clamps value to maxQuantity when input exceeds it", async () => {
    const onQuantityChange = jest.fn();
    render(
      <QuantitySelector {...defaultProps} maxQuantity={10} onQuantityChange={onQuantityChange} />
    );

    const input = screen.getByRole("spinbutton", { name: /quantity/i });
    await user.clear(input);
    await user.type(input, "99");

    expect(onQuantityChange).toHaveBeenCalledWith(10);
  });

  it("renders quantity label", () => {
    render(<QuantitySelector {...defaultProps} />);

    expect(screen.getByText("Quantity")).toBeInTheDocument();
  });

  it("does not show available text when maxQuantity is 0", () => {
    render(<QuantitySelector {...defaultProps} maxQuantity={0} />);

    expect(screen.queryByText(/available/i)).not.toBeInTheDocument();
  });
});
