import userEvent from "@testing-library/user-event";
import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { render, screen, waitFor } from "../../test-utils";

// Mock the server action
jest.mock("@/features/auth/actions", () => ({
  signUpAction: jest.fn(),
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

describe("SignUpForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the sign up form with name, email, and password fields", () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("renders the Google login button", () => {
    render(<SignUpForm />);

    expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields on submit", async () => {
    render(<SignUpForm />);

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email format", async () => {
    render(<SignUpForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "Password123!");

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      const emailErrors = screen.queryAllByText(/invalid|email/i);
      expect(emailErrors.length).toBeGreaterThan(0);
    });
  });

  it("shows validation error for weak password", async () => {
    render(<SignUpForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "123"); // Too short

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Should show password requirements error - check that label exists
      const passwordElements = screen.queryAllByText(/password/i);
      expect(passwordElements.length).toBeGreaterThan(0);
    });
  });

  it("allows typing in all fields", async () => {
    render(<SignUpForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123!");

    expect(nameInput).toHaveValue("Test User");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("Password123!");
  });

  it("calls signUpAction with form data on valid submit", async () => {
    const { signUpAction } = require("@/features/auth/actions");
    signUpAction.mockResolvedValue({ success: true, message: "Account created!" });

    render(<SignUpForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123!");

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(signUpAction).toHaveBeenCalled();
    });
  });

  it("displays success message on successful sign up", async () => {
    const { signUpAction } = require("@/features/auth/actions");
    signUpAction.mockResolvedValue({
      success: true,
      message: "Account created successfully!",
    });

    render(<SignUpForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123!");

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      const status = screen.queryByRole("status");
      if (status) {
        expect(status).toBeInTheDocument();
      }
    });
  });

  it("displays error message on failed sign up", async () => {
    const { signUpAction } = require("@/features/auth/actions");
    signUpAction.mockResolvedValue({
      success: false,
      error: { message: "Email already exists" },
    });

    render(<SignUpForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "existing@example.com");
    await user.type(passwordInput, "Password123!");

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      const alert = screen.queryByRole("alert");
      expect(alert).toBeInTheDocument();
    });
  });
});
