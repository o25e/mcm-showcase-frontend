import { request } from './client';

export function getRecommendations(arSessionId, categoryCode, signal) {
  return request(`/api/recommendations/ar-sessions/${arSessionId}/categories/${categoryCode}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
}

export function refreshRecommendations(arSessionId, categoryCode, signal) {
  return request(`/api/recommendations/ar-sessions/${arSessionId}/categories/${categoryCode}/refresh`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    signal,
  });
}

export function createAvatarLook(arSessionId, signal) {
  return request(`/api/recommendations/avatar-look/${arSessionId}`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
    },
    signal,
  });
}
