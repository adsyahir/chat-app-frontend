// Client-side exports (safe for client components)
export { authenticatedClientFetch } from './client.js';
export { authAPI } from './auth.js';
export { socketAPI } from './socket.js';
export { chatAPI } from './chat.js';
export { userAPI } from './user.js';
export { friendsAPI } from './friends.js';
// Server-side exports (only for server components)
// Import these directly from './base.js' in server components only