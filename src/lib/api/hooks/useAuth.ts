import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authService from '../services/auth.service';
import { getAuthToken, getStoredUser } from '../axios';
import { LoginCredentials, LoginResponseData, UserProfile } from '@/types/api';

export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  user: () => [...AUTH_QUERY_KEYS.all, 'user'] as const,
};

/**
 * Hook to perform user login using TanStack Query mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponseData, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Invalidate and prefetch or set user data
      const user = data.user || (data as any)?.data?.user;
      if (user) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.user(), user);
      } else {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user() });
      }
    },
  });
}

/**
 * Hook to perform user logout using TanStack Query mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached queries on logout
      queryClient.setQueryData(AUTH_QUERY_KEYS.user(), null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to fetch current authenticated user profile
 */
export function useCurrentUser() {
  const hasToken = typeof window !== 'undefined' ? !!getAuthToken() : false;
  const initialUser = typeof window !== 'undefined' ? getStoredUser<UserProfile>() : null;

  return useQuery<UserProfile, Error>({
    queryKey: AUTH_QUERY_KEYS.user(),
    queryFn: () => authService.getCurrentUser(),
    enabled: hasToken,
    initialData: initialUser || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
