import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { login } from "./authService";

describe("login function", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.fetch = originalFetch;
  });

  const user = {
    email: "test@example.com",
    password: "password123",
    token: null,
  };

  it("should return JSON data on successful login", async () => {
    const mockResponse = { token: "jwt-token", userId: 1 };
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await login(user);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it("should throw an error with response text on failed login", async () => {
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: vi.fn().mockResolvedValueOnce("Invalid credentials"),
    });

    await expect(login(user)).rejects.toThrow(
      "Login failed: Invalid credentials"
    );

    expect(global.fetch).toHaveBeenCalled();
  });

  it("should throw an error with status text if response text is empty", async () => {
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: vi.fn().mockResolvedValueOnce(""),
    });

    await expect(login(user)).rejects.toThrow(
      "Login failed: Internal Server Error"
    );

    expect(global.fetch).toHaveBeenCalled();
  });

  it("should return null if status is 204 No Content", async () => {
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: vi.fn().mockResolvedValueOnce(""),
    });

    const result = await login(user);
    expect(result).toBeNull();

    expect(global.fetch).toHaveBeenCalled();
  });
});
