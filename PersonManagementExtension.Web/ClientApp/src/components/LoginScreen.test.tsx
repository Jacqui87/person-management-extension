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
    render(<LoginScreen onLogin={vi.fn()} tokenInvalid={false} />);

    expect(screen.getByLabelText(/person_editor.email/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/person_editor.password/i)
    ).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /login.login/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("allows user to type email and password", async () => {
    render(<LoginScreen onLogin={vi.fn()} tokenInvalid={false} />);

    const emailInput = screen.getByLabelText(
      /person_editor.email/i
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /person_editor.password/i
    ) as HTMLInputElement;

    await userEvent.type(emailInput, "user@example.com");
    await userEvent.type(passwordInput, "mypassword");

    expect(emailInput.value).toBe("user@example.com");
    expect(passwordInput.value).toBe("mypassword");
  });

  it("calls onLogin with email, password, and token from localStorage on submit", async () => {
    const mockOnLogin = vi.fn();
    render(<LoginScreen onLogin={mockOnLogin} tokenInvalid={false} />);

    const emailInput = screen.getByLabelText(/person_editor.email/i);
    const passwordInput = screen.getByLabelText(/person_editor.password/i);
    const button = screen.getByRole("button", { name: /login.login/i });

    await userEvent.type(emailInput, "test@example.com");
    await userEvent.type(passwordInput, "pass123");

    fireEvent.click(button);

    expect(mockOnLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "pass123",
      token: "mock-token",
    });
  });

  it("displays error message if onLogin throws", async () => {
    // To test error handling, mock onLogin to throw
    const throwingOnLogin = vi.fn(() => {
      throw new Error("Login failed");
    });

    render(<LoginScreen onLogin={throwingOnLogin} tokenInvalid={false} />);

    const emailInput = screen.getByLabelText(/person_editor.email/i);
    const passwordInput = screen.getByLabelText(/person_editor.password/i);
    const button = screen.getByRole("button", { name: /login.login/i });

    await userEvent.type(emailInput, "fail@example.com");
    await userEvent.type(passwordInput, "wrongpass");

    fireEvent.click(button);

    // Because onLogin throws synchronously in this code,
    // error message should be set and rendered.

    expect(await screen.findByText(/login.failed/i)).toBeInTheDocument();
  });
});
