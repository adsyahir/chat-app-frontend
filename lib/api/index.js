// Client-side exports (safe for client components)
export { authenticatedClientFetch } from './client.js';
export { authAPI } from './auth.js';
export { socketAPI } from './socket.js';

// Server-side exports (only for server components)
// Import these directly from './base.js' in server components only