import { API_BASE_URL } from './config';
import { ko } from '../i18n/ko';

const API_MESSAGES = {
  request: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
  unauthorized: '로그인이 필요합니다.',
  forbidden: '이 요청을 처리할 권한이 없습니다.',
  notFound: '요청한 정보를 찾을 수 없습니다.',
  conflict: '최신 상태와 충돌이 발생했습니다. 다시 시도해주세요.',
  tooManyRequests: '요청이 많습니다. 잠시 후 다시 시도해주세요.',
  server: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  invalidResponse: '서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

export class ApiError extends Error {
  constructor(message, status = 0, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options.code;
    this.cause = options.cause;
  }
}

function messageForStatus(status) {
  if (status === 401) return API_MESSAGES.unauthorized;
  if (status === 403) return API_MESSAGES.forbidden;
  if (status === 404) return API_MESSAGES.notFound;
  if (status === 409) return API_MESSAGES.conflict;
  if (status === 429) return API_MESSAGES.tooManyRequests;
  if (status >= 500) return API_MESSAGES.server;
  return API_MESSAGES.request;
}

export function toUserMessage(error, fallback = API_MESSAGES.request) {
  if (error?.name === 'AbortError') return '';
  return error?.message || fallback;
}

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
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError(ko.errors.network, 0, { cause: error });
  }

  if (!response.ok) {
    throw new ApiError(messageForStatus(response.status), response.status);
  }

  if (response.status === 204) return null;

  try {
    const payload = await response.json();
    return unwrapApiResponse(payload);
  } catch (error) {
    throw new ApiError(API_MESSAGES.invalidResponse, response.status, { cause: error });
  }
}
