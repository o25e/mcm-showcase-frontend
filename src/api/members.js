import { API_BASE_URL } from './config';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function loginMember({ loginId, password }) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/members/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password }),
    });
  } catch {
    throw new ApiError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  }

  if (response.status === 401) {
    throw new ApiError('아이디 또는 비밀번호를 확인해 주세요.', 401);
  }

  if (!response.ok) {
    throw new ApiError('로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.', response.status);
  }

  return response.json();
}
