import type { LoginRequest, RegisterRequest, User } from '~~/shared/types';

export const useAuth = () => {
  // const authStore = useAuthStore();
  const { loggedIn, session, user, ready, openInPopup, clear, fetch: refreshSession } = useUserSession();
  const isLoading = ref(false);

  const login = async (credentials: LoginRequest) => {
    $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
      .then(async () => {
        // Refresh the session on client-side and redirect to the home page
        await refreshSession();
        await navigateTo('/');
      })
      .catch(() => alert('Bad credentials'));
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
