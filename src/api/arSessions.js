import { request } from './client';

export async function evaluateArSessionMessage(arSessionId, selectedLanguage = 'ko', signal) {
  if (!Number.isFinite(arSessionId)) {
    return { skipped: true };
  }

  return request(`/api/ar-sessions/${arSessionId}/messages/evaluate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': selectedLanguage === 'en' ? 'en' : 'ko',
    },
    signal,
  });

}

export function createArSession(memberId) {
  return request('/api/ar-sessions', {
    method: 'POST',
    headers: { Accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify(memberId ? { memberId } : {}),
  });
}

export function updateArSessionGender(arSessionId, gender) {
  return request(`/api/ar-sessions/${arSessionId}/gender`, {
    method: 'PATCH',
    headers: { Accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify({ gender }),
  });
}

export function getArSession(arSessionId, signal) {
  return request(`/api/ar-sessions/${arSessionId}`, {
    headers: { Accept: '*/*' },
    signal,
  });
}

export function linkMemberToArSession(arSessionId, { memberId, gender }) {
  return request(`/api/ar-sessions/${arSessionId}/member`, {
    method: 'PATCH',
    headers: { Accept: '*/*', 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, ...(gender ? { gender } : {}) }),
  });
}
