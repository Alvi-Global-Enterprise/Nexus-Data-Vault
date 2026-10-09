import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://3.148.244.66:8003/api/v1/';

// Token Storage Keys
export const TOKEN_STORAGE_KEY = 'nexus_auth_token';
export const USER_STORAGE_KEY = 'nexus_auth_user';

// Helper functions for client-side token storage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  // Also store in document cookie for SSR/middleware compatibility if needed
  document.cookie = `${TOKEN_STORAGE_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  document.cookie = `${TOKEN_STORAGE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const getStoredUser = <T = any>(): T | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_STORAGE_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Auth Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error message & handle 401
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle 401 Unauthorized (Expired / Invalid session)
    if (status === 401) {
      // If we received 401 from a protected endpoint (and not the login attempt itself)
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        removeAuthToken();
      }
    }

    // Extract a clear, readable error message
    let readableMessage =
      data?.message ||
      (status === 404
        ? 'Requested endpoint was not found (404).'
        : status === 401
        ? 'Unauthorized: Invalid credentials or session expired.'
        : status === 500
        ? 'Internal Server Error. Please try again later.'
        : error.message || 'An unexpected network error occurred.');

    // If Laravel validation errors are provided, append the first validation error
    if (data?.errors && typeof data.errors === 'object') {
      const errorKeys = Object.keys(data.errors);
      if (errorKeys.length > 0) {
        const firstField = errorKeys[0];
        const firstMsg = data.errors[firstField]?.[0];
        if (firstMsg) {
          readableMessage = firstMsg;
        }
      }
    }

    const enhancedError = new Error(readableMessage) as Error & {
      statusCode?: number;
      rawResponse?: any;
      validationErrors?: Record<string, string[]>;
    };

    enhancedError.statusCode = status;
    enhancedError.rawResponse = data;
    enhancedError.validationErrors = data?.errors;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;
