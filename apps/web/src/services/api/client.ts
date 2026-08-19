import { AUTH_EXPIRED_EVENT } from '@/features/auth/constants/auth.constants';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export type ApiError = Error & {
  status: number;
  code: string;
  details?: unknown;
};

interface ApiRequestOptions extends RequestInit {
  skipAuthRefresh?: boolean;
}

function createApiError(
  status: number,
  code: string,
  message: string,
  details?: unknown
): ApiError {
  return Object.assign(new Error(message), {
    status,
    code,
    details,
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error && 'code' in error;
}

interface RequestResult {
  response: Response;
  body: unknown;
}

async function requestOnce(
  path: string,
  options: RequestInit
): Promise<RequestResult> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,

    credentials: 'include',

    headers: {
      'Content-Type': 'application/json',

      ...options.headers,
    },
  });

  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return {
    response,
    body,
  };
}

/*
 * Prevent five concurrent 401s
 * from producing five refresh calls.
 */
let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',

    credentials: 'include',

    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function shouldAttemptRefresh(path: string) {
  const excludedPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  return !excludedPaths.includes(path);
}

function notifyAuthExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuthRefresh = false, ...requestOptions } = options;

  let result = await requestOnce(path, requestOptions);

  if (
    result.response.status === 401 &&
    !skipAuthRefresh &&
    shouldAttemptRefresh(path)
  ) {
    const refreshed = await attemptRefresh();

    if (refreshed) {
      /*
       * Retry original request
       * once with fresh cookies.
       */
      result = await requestOnce(path, requestOptions);
    } else {
      notifyAuthExpired();
    }
  }

  if (!result.response.ok) {
    const apiBody = result.body as {
      error?: {
        code?: string;
        message?: string;
        details?: unknown;
      };
    } | null;

    throw createApiError(
      result.response.status,

      apiBody?.error?.code ?? 'API_ERROR',

      apiBody?.error?.message ?? 'Something went wrong.',

      apiBody?.error?.details
    );
  }

  return result.body as T;
}
