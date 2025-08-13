export const authenticatedClientFetch = async (url, options = {}) => {
    // Get backend host from public env var
    const backendHost = process.env.NEXT_PUBLIC_BACKEND_URL;
    // Build full URL
    const fullUrl = url.startsWith('http') ? url : `${backendHost}${url.startsWith('/') ? url : `/${url}`}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // This sends cookies automatically
      ...options,
    };
  
    const response = await fetch(fullUrl, defaultOptions);
    console.log(response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return response.json();
  };