import { useAuth } from '../context/AuthContext.jsx';

export const useApiClient = () => {
  const { token } = useAuth();

  const apiFetch = async (path, options = {}) => {
    try {
      // Use provided signal or create new one
      const controller = options.signal ? null : new AbortController();
      const signal = options.signal || controller.signal;
      
      let timeoutId = null;
      if (!options.signal && controller) {
        timeoutId = setTimeout(() => {
          controller.abort();
        }, 10000);
      }

      const res = await fetch(`http://localhost:5000${path}`, {
        ...options,
        signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
          ...(options.headers || {}),
        },
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        // Don't throw timeout error for chat polling - return empty array
        if (path.includes('/chat/messages')) {
          return [];
        }
        // For other requests, throw a user-friendly error
        throw new Error('Connection slow hai. Please wait karein.');
      }
      // Handle network errors silently for chat polling
      if (err.message && err.message.includes('Failed to fetch')) {
        console.error('Network error (silent):', err);
        // Return empty array for chat messages to prevent errors
        if (path.includes('/chat/messages')) {
          return [];
        }
        // For dashboard data, return null instead of throwing
        if (path.includes('/api/reports/summary') || path.includes('/api/users')) {
          return null;
        }
        return null;
      }
      if (err.message) {
        throw err;
      }
      throw new Error('Network error. Please check your connection.');
    }
  };

  return { apiFetch };
};


