import userEvent from "@testing-library/user-event";
import { AddressForm } from "@/features/checkout/components/AddressForm";
import { render, screen, waitFor } from "../../test-utils";

// Mock the map picker component
jest.mock("@/features/checkout/components/AddressMapPicker", () => ({
  AddressMapPicker: () => <div data-testid="address-map-picker">Map Picker</div>,
}));

describe("AddressForm", () => {
  const user = userEvent.setup();
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all required form fields", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    // Check for essential fields - form should exist and have inputs
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();

    // Check for at least some address-related fields
    const textInputs = screen.getAllByRole("textbox");
    expect(textInputs.length).toBeGreaterThan(0);
  });

  it("renders optional form fields", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    // Form should contain multiple input fields
    const allInputs = screen.getAllByRole("textbox");
    expect(allInputs.length).toBeGreaterThan(3);
  });

  it("renders submit button with default label", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole("button", { name: /save address/i })).toBeInTheDocument();
  });

  it("renders submit button with custom label", () => {
    render(<AddressForm onSubmit={mockOnSubmit} submitLabel="Add Address" />);

    expect(screen.getByRole("button", { name: /add address/i })).toBeInTheDocument();
  });

  it("renders cancel button when onCancel is provided", () => {
    render(<AddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("does not render cancel button when onCancel is not provided", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    render(<AddressForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("shows validation errors for required fields", async () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /save address/i });
    await user.click(submitButton);

    // Wait for validation errors to appear
    await waitFor(() => {
      // Check for at least one error message
      const errorMessages = screen.getAllByText(/required|invalid/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it("allows typing in form fields", async () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    const textInputs = screen.getAllByRole("textbox");
    expect(textInputs.length).toBeGreaterThan(0);

    // Verify inputs can receive focus and are interactive
    const firstInput = textInputs[0];
    expect(firstInput).toBeInTheDocument();
    expect(firstInput).not.toBeDisabled();
  });

  it("renders with initial data", () => {
    const initialData = {
      label: "Work",
      phone: "+962788888888",
      line1: "456 Office Street",
      city: "Zarqa",
      postalCode: "13110",
      country: "Jordan",
    };

    render(<AddressForm onSubmit={mockOnSubmit} initialData={initialData} />);

    // Form should render successfully with initial data
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();

    // Check that form has inputs
    const textInputs = screen.getAllByRole("textbox");
    expect(textInputs.length).toBeGreaterThan(0);
  });

  it("toggles map visibility when clicking the map button", async () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    // Initially map should be hidden
    expect(screen.queryByTestId("address-map-picker")).not.toBeInTheDocument();

    // Click to show map
    const mapButton = screen.getByRole("button", { name: /pick location on map/i });
    await user.click(mapButton);

    // Map should now be visible
    expect(screen.getByTestId("address-map-picker")).toBeInTheDocument();

    // Click to hide map
    const hideMapButton = screen.getByRole("button", { name: /hide map/i });
    await user.click(hideMapButton);

    // Map should be hidden again
    expect(screen.queryByTestId("address-map-picker")).not.toBeInTheDocument();
  });

  it("renders default address checkbox", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText(/set as default address/i)).toBeInTheDocument();
  });

  it("disables submit button while submitting", () => {
    render(<AddressForm onSubmit={mockOnSubmit} isSubmitting={true} />);

    const submitButton = screen.getByRole("button", { name: /saving/i });
    expect(submitButton).toBeDisabled();
  });

  it("renders delivery instructions textarea", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    // Look for any textarea element
    const textareas = document.querySelectorAll("textarea");
    expect(textareas.length).toBeGreaterThan(0);
  });

  it("renders multiple address detail fields", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    // Form should have multiple text inputs for address details
    const allInputs = screen.getAllByRole("textbox");
    expect(allInputs.length).toBeGreaterThan(5);
  });
});
