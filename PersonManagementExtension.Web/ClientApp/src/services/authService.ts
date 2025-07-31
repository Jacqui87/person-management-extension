import { LoginCredentialsViewModel } from "../models/LoginCredentialsViewModel";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/auth`;

export async function login(user: {
  password: string | null;
  email: string | null;
  token: string | null;
}): Promise<LoginCredentialsViewModel | null> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${text || res.statusText}`);
  }

  // If response.status is 204 No Content or body length is zero, return null
  if (res.status === 204) {
    return null;
  }

  return res.json();
}
