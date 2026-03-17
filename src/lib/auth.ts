/**
 * src/lib/auth.ts
 * Helpers for storing and reading the JWT token from localStorage.
 */

const TOKEN_KEY = "dataku_access_token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const isLoggedIn = (): boolean => !!getToken();

/** Returns headers including Authorization if a token exists. */
export const authHeaders = (): HeadersInit => {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
};

/** Returns headers for multipart/form-data requests (no Content-Type — browser sets boundary). */
export const authFormHeaders = (): HeadersInit => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
