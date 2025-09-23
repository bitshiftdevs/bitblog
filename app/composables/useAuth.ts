import type { LoginRequest, RegisterRequest } from '~~/shared/types';

export const useAuth = () => {
  const { loggedIn, session, user, ready, openInPopup, clear, fetch: refreshSession } = useUserSession();
  const isLoading = ref(false);

  return {
    user: user.value,
    isAuthenticated: loggedIn.value,
    isReady: ready.value,
    canAccessAdmin: user.value?.isAdmin,
    async login(credentials: LoginRequest) {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });
      await refreshSession();
    },
    refreshSession,
    openInPopup,
    logout: async () => {
      await clear();
      await navigateTo('/auth/login');
    },
    async register(userData: RegisterRequest) {
      isLoading.value = true;

      try {
        await $fetch<{ data: any }>('/api/auth/register', {
          method: 'POST',
          body: userData,
        });
      } catch (error) {
        throw error;
      } finally {
        isLoading.value = false;
      }
    },
  };
};
