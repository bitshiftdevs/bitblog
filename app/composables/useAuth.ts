export const useAuth = () => {
  const authStore = useAuthStore();

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    canAccessAdmin: computed(() => authStore.canAccessAdmin),
    login: authStore.login,
    logout: authStore.logout,
    register: authStore.register,
  };
};
