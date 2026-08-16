import { API_BASE_URL } from './config';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: '*/*', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    ...options,
  });

  if (!response.ok) throw new Error(`My Closet API failed (${response.status})`);
  return response.status === 204 ? null : response.json();
}

export function getMyClosetLook(styleProfileId) {
  return request(`/api/my-closet/${encodeURIComponent(styleProfileId)}`);
}

export function saveLookToMember(styleProfileId, memberId) {
  return request(`/api/my-closet/${encodeURIComponent(styleProfileId)}/member`, {
    method: 'PATCH',
    body: JSON.stringify({ memberId }),
  });
}

export function getMyClosetList(memberId) {
  return request(`/api/my-closet?memberId=${encodeURIComponent(memberId)}`);
}
