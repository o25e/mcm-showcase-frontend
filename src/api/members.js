import { unwrapApiResponse } from './client';
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
    throw new ApiError(ko.errors.network);
  }

  if (response.status === 401) {
    throw new ApiError(ko.errors.invalidCredentials, 401);
  }

  if (!response.ok) {
    throw new ApiError(ko.errors.loginFailed, response.status);
  }

  return unwrapApiResponse(await response.json());
}
import { ko } from '../i18n/ko';
