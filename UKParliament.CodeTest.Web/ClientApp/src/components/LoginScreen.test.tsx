import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginScreen from "./LoginScreen";

describe("LoginScreen", () => {
  // Mock localStorage.getItem before each test
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue("mock-token"),
    });
  });

  it("renders email and password inputs and login button", () => {
    render(<LoginScreen onLogin={vi.fn()} />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /login/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it.skip("allows user to type email and password", async () => {
    render(<LoginScreen onLogin={vi.fn()} />);

    const emailInput = screen.getByLabelText(
      /email address/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /password/i
    ) as HTMLInputElement;

    await userEvent.type(emailInput, "user@example.com");
    await userEvent.type(passwordInput, "mypassword");

    expect(emailInput.value).toBe("user@example.com");
    expect(passwordInput.value).toBe("mypassword");
  });

  it("calls onLogin with email, password, and token from localStorage on submit", async () => {
    const mockOnLogin = vi.fn();
    render(<LoginScreen onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole("button", { name: /login/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "pass123");

    fireEvent.click(button);

    expect(mockOnLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "pass123",
      token: "mock-token",
    });
  });

  it.skip("disables the button and shows 'Logging in...' while loading", async () => {
    // To test loading state, we need to simulate async onLogin prop that delays

    // We'll create a component wrapper to inject async onLogin and control loading state:
    const asyncOnLogin = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 100);
        })
    );

    render(<LoginScreen onLogin={asyncOnLogin} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole("button", { name: /login/i });

    await userEvent.type(emailInput, "user@example.com");
    await userEvent.type(passwordInput, "password");

    // Submit form (button click causes handleSubmit)
    fireEvent.click(button);

    // Button should be disabled and show "Logging in..."
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/logging in.../i);

    // Wait for asyncOnLogin promise to resolve before finishing test
    await asyncOnLogin.mock.results[0].value;
  });

  it("displays error message if onLogin throws", async () => {
    // To test error handling, mock onLogin to throw
    const throwingOnLogin = vi.fn(() => {
      throw new Error("Login failed");
    });

    render(<LoginScreen onLogin={throwingOnLogin} />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole("button", { name: /login/i });

    await userEvent.type(emailInput, "fail@example.com");
    await userEvent.type(passwordInput, "wrongpass");

    fireEvent.click(button);

    // Because onLogin throws synchronously in this code,
    // error message should be set and rendered.

    expect(
      await screen.findByText(/login failed\. please check your credentials\./i)
    ).toBeInTheDocument();
  });
});
