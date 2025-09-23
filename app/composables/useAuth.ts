import type { LoginRequest, RegisterRequest, User } from '~~/shared/types';

export const useAuth = () => {
  // const auth = useAuth();
  const { loggedIn, session, user, ready, openInPopup, clear, fetch: refreshSession } = useUserSession();
  const isLoading = ref(false);

  const login = async (credentials: LoginRequest) => {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    });
    await refreshSession();
  };

  return {
    user: user.value as User,
    isAuthenticated: loggedIn.value,
    isReady: ready.value,
    canAccessAdmin: computed(() => (user.value as User)?.isAdmin),
    login,
    logout: async () => {
      await clear();
      await navigateTo('/auth/login');
    },
    async register(userData: RegisterRequest) {
      isLoading.value = true;

      try {
        const { data } = await $fetch<{ data: any }>('/api/auth/register', {
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
