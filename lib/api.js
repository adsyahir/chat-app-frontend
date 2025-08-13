// Client-side API exports (safe for client components)
export { authenticatedClientFetch, authAPI, socketAPI } from './api/index.js';

// Server-side API exports (only for server components)
// Use: import { authenticatedServerFetch } from '@/app/lib/server-api.js' in server components