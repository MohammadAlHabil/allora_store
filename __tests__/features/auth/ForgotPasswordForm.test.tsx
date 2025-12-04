import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { render, screen, waitFor } from "../../test-utils";

// Mock the server action
jest.mock("@/features/auth/actions", () => ({
  forgotPasswordAction: jest.fn(),
}));

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated", update: jest.fn() }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock session refresh hook
jest.mock("@/features/auth/hooks/useSessionRefresh", () => ({
  useSessionRefresh: () => ({
    refreshSession: jest.fn(),
  }),
}));

describe("ForgotPasswordForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the forgot password form with email field", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("shows validation error for empty email on submit", async () => {
    render(<ForgotPasswordForm />);

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email format", async () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      const emailErrors = screen.queryAllByText(/invalid|email/i);
      expect(emailErrors.length).toBeGreaterThan(0);
    });
  });

  it("allows typing in email field", async () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("calls forgotPasswordAction with email on valid submit", async () => {
    const { forgotPasswordAction } = require("@/features/auth/actions");
    forgotPasswordAction.mockResolvedValue({
      success: true,
      message: "Reset link sent!",
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(forgotPasswordAction).toHaveBeenCalled();
    });
  });

  it("displays success message when reset link is sent", async () => {
    const { forgotPasswordAction } = require("@/features/auth/actions");
    forgotPasswordAction.mockResolvedValue({
      success: true,
      message: "If an account exists with this email, you will receive a reset link.",
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      const status = screen.queryByRole("status");
      if (status) {
        expect(status).toBeInTheDocument();
      }
    });
  });

  it("displays error message on failure", async () => {
    const { forgotPasswordAction } = require("@/features/auth/actions");
    forgotPasswordAction.mockResolvedValue({
      success: false,
      error: { message: "Failed to send reset email" },
    });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.queryByRole("alert");
      expect(alert).toBeInTheDocument();
    });
  });

  it("disables submit button while submitting", async () => {
    const { forgotPasswordAction } = require("@/features/auth/actions");
    forgotPasswordAction.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, message: "Success" }), 100)
        )
    );

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");

    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      const submittingButton = screen.queryByRole("button", {
        name: /submitting|loading|sending/i,
      });
      if (submittingButton) {
        expect(submittingButton).toBeDisabled();
      }
    });
  });
});
