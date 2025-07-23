const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/auth`;

export async function login(user: { firstName: string; email: string }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${text || res.statusText}`);
  }

  return res.json();
}
