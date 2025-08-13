// Server-side utilities should be imported only in server components
// This file is for server-side API utilities that use next/headers

import 'server-only';
import { cookies } from "next/headers";

export const authenticatedServerFetch = async (url, options = {}) => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("connect.sid");

  if (!sessionCookie) {
    throw new Error("No session cookie found");
  }

  // Get backend host from environment variables
  const backendHost = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  // Build full URL if it's a relative path
  const fullUrl = url.startsWith('http') ? url : `${backendHost}${url.startsWith('/') ? url : `/${url}`}`;

  const defaultOptions = {
    headers: {
      Cookie: `connect.sid=${sessionCookie.value}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
    ...options,
  };

  const response = await fetch(fullUrl, defaultOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};