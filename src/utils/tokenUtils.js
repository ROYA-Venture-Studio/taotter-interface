// Utility functions for JWT token management

// Decode a JWT token (returns payload or null)
export function decodeJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Get expiry timestamp (in ms) from JWT token
export function getTokenExpiry(token) {
  const payload = decodeJwt(token);
  if (payload && payload.exp) {
    return payload.exp * 1000;
  }
  return null;
}

// Returns true if token will expire within the next `thresholdMs` ms
export function willTokenExpireSoon(token, thresholdMs = 10 * 60 * 1000) {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return expiry - Date.now() < thresholdMs;
}
