import { request as requestApi } from './client';

async function request(path, options = {}) {
  return requestApi(path, {
    headers: { Accept: '*/*', ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
    ...options,
  });
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
