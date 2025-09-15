
// apps/web/composables/useAuth.ts
export const useAuth = () => {
  const authStore = useAuthStore()
  
  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    canAccessAdmin: computed(() => authStore.canAccessAdmin),
    hasPermission: (permission: string) => authStore.hasPermission(permission),
    hasAnyPermission: (permissions: string[]) => authStore.hasAnyPermission(permissions),
    login: authStore.login,
    logout: authStore.logout,
    register: authStore.register,
  }
}
