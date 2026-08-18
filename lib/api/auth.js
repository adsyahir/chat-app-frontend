// NEXT_PUBLIC_* is inlined at build time. When it is missing the template
// literal silently produced "undefined/api/...", so every call failed as an
// opaque network error instead of naming the real problem.
if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  console.error(
    "NEXT_PUBLIC_BACKEND_URL is not set. Add it to .env.local and restart the dev server."
  );
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    return response.json();
  },

  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      // Tag the payload so callers can tell a rejected signup apart from a
      // fetch that never reached the server.
      const errorData = await response.json().catch(() => ({
        message: `Registration failed with status ${response.status}`,
      }));
      throw Object.assign(new Error(errorData.message || "Registration failed"), {
        isApiError: true,
        ...errorData,
      });
    }

    return response.json();
  },

  // Returns the session user, or null when the cookie is missing or expired.
  // Mounted at the backend root, not under /api.
  session: async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/session`,
      { credentials: "include", cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.user : null;
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `Logout failed with status: ${response.status}` };
      }
      throw errorData;
    }

    // Handle empty response body (common for logout endpoints)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return { success: true };
      }
    }
    
    return { success: true };
  },
};