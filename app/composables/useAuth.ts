export const useAuth = () => {
  const { loggedIn, user, ready, openInPopup, clear, fetch: refreshSession } = useUserSession();

  return {
    user: user.value,
    isAuthenticated: loggedIn.value,
    isReady: ready.value,
    canAccessAdmin: user.value?.isAdmin,
    refreshSession,
    openInPopup,
    logout: async () => {
      await clear();
      await navigateTo('/auth');
    },
  };
};
