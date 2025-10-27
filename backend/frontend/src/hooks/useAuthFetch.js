import { useAuth } from "../contexts/AuthContext";

export function useAuthFetch() {
  const { token } = useAuth();

  return (url, options = {}) => {
    const headers = {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(url, { ...options, headers });
  };
}
