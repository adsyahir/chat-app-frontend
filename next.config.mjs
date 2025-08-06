/** @type {import('next').NextConfig} */
const nextConfig = {
    publicRuntimeConfig: {
      backendUrl: process.env.BACKEND_URL,
    },
  };
  
  export default nextConfig;