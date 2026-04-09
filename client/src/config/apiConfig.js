// Central API configuration
// In production on Render, the frontend and backend are served from the same domain.
// Using relative paths ('/api') ensures API calls always reach the correct server.
// VITE_API_URL can be set for local dev or separate deployments.

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_URL = `${API_BASE_URL}/api`;

export default API_URL;
