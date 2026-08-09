export const useAuth = () => {
  const { loggedIn, user, ready, openInPopup, clear, fetch: refreshSession } = useUserSession();

  return reactive({
    user,
    isAuthenticated: loggedIn,
    isReady: ready,
    canAccessAdmin: computed(() => user.value?.isAdmin),
    refreshSession,
    openInPopup,
    logout: async () => {
      await clear();
      await refreshSession();
      await navigateTo('/auth');
    },
  });
};
