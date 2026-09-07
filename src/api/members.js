import { ApiError, request } from './client';
import { ko } from '../i18n/ko';

export async function loginMember({ loginId, password }) {
  try {
    return await request('/api/members/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password }),
    });
  } catch (error) {
    if (error?.status === 401) {
      throw new ApiError(ko.errors.invalidCredentials, 401, { cause: error });
    }
    throw error;
  }
}
