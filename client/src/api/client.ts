// Centralized HTTP client for PayTheBills frontend

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  console.log("aaaa"+envUrl);
  if (typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

const TOKEN_KEY = 'paythebills_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined | null>;
}

export async function fetchApi<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...restOptions } = options;

  let urlPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      urlPath += (urlPath.includes('?') ? '&' : '?') + queryString;
    }
  }

  const fullUrl = `${API_BASE_URL}${urlPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (import.meta.env.DEV) {
    console.debug(`[API] ${restOptions.method || 'GET'} -> ${fullUrl}`);
  }

  const response = await fetch(fullUrl, {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data && data.message) {
        errorMsg = data.message;
      }
    } catch {
      // Body is not JSON
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
