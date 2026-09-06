import { API_BASE_URL } from './config';

/**
 * Backend responses are consistently shaped as { success, data }.
 * Keep that transport detail inside the API layer so callers receive DTOs.
 */
export function unwrapApiResponse(payload) {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data;
  }

  return payload;
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  if (response.status === 204) return null;

  const payload = await response.json();
  return unwrapApiResponse(payload);
}
