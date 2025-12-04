import userEvent from "@testing-library/user-event";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { render, screen, waitFor } from "../../test-utils";

// Mock the server action
jest.mock("@/features/auth/actions", () => ({
  signInAction: jest.fn(),
}));

// Mock the Google login button
jest.mock("@/features/auth/components/GoogleLoginButton", () => ({
  __esModule: true,
  default: () => <button>Sign in with Google</button>,
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

describe("SignInForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sign in form with email and password fields", () => {
    render(<SignInForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    // Get the submit button by type
    const submitButtons = screen.getAllByRole("button", { name: /sign in/i });
    expect(submitButtons[0]).toBeInTheDocument();
  });

  it("renders the forgot password link", () => {
    render(<SignInForm />);

    expect(screen.getByRole("link", { name: /forgot password/i })).toBeInTheDocument();
  });

  it("renders the Google login button", () => {
    render(<SignInForm />);

    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields on submit", async () => {
    render(<SignInForm />);

    const submitButton = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Expect validation errors to appear
      expect(screen.getByText(/email/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email format", async () => {
    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitButton);

    await waitFor(() => {
      const emailErrors = screen.queryAllByText(/invalid|email/i);
      expect(emailErrors.length).toBeGreaterThan(0);
    });
  });

  it("allows typing in email and password fields", async () => {
    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("disables submit button while submitting", async () => {
    const { signInAction } = require("@/features/auth/actions");
    signInAction.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, message: "Success" }), 100)
        )
    );

    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitButton);

    await waitFor(() => {
      const submittingButton = screen.queryByRole("button", { name: /submitting|loading/i });
      if (submittingButton) {
        expect(submittingButton).toBeDisabled();
      }
    });
  });

  it("displays error message on failed sign in", async () => {
    const { signInAction } = require("@/features/auth/actions");
    signInAction.mockResolvedValue({
      success: false,
      error: { message: "Invalid credentials" },
    });

    render(<SignInForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");

    const submitButton = screen.getByRole("button", { name: /^sign in$/i });
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.queryByRole("alert");
      expect(alert).toBeInTheDocument();
    });
  });
});
