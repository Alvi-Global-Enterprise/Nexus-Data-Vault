import apiClient, {
  setAuthToken,
  removeAuthToken,
  setStoredUser,
} from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { LoginCredentials, LoginResponseData, UserProfile } from '@/types/api';

export const authService = {
  /**
   * Log in user with credentials
   */
  async login(credentials: LoginCredentials): Promise<LoginResponseData> {
    const response = await apiClient.post<LoginResponseData>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        email: credentials.email,
        password: credentials.password,
      }
    );

    const data = response.data;

    // Handle token from common response structures
    const token = data.token || data.access_token || (data as any)?.data?.token;
    if (token) {
      setAuthToken(token);
    }

    // Save user if provided in response
    const user = data.user || (data as any)?.data?.user;
    if (user) {
      setStoredUser(user);
    }

    return data;
  },

  /**
   * Logout current authenticated user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Even if server call fails, we still clear local credentials
      console.warn('Logout API notification failed, clearing local state', error);
    } finally {
      removeAuthToken();
    }
  },

  /**
   * Fetch current authenticated user's profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(API_ENDPOINTS.AUTH.USER);
    const userData = (response.data as any)?.data || response.data;
    setStoredUser(userData);
    return userData;
  },
};

export default authService;
