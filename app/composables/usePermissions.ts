export const usePermissions = () => {
  const authStore = useAuthStore();

  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return authStore.hasAnyPermission(permissions);
  };

  const requirePermission = (permission: string) => {
    if (!hasPermission(permission)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions',
      });
    }
  };

  const canManagePosts = computed(() =>
    hasAnyPermission(['posts.write', 'posts.publish', 'admin']),
  );

  const canPublishPosts = computed(() =>
    hasAnyPermission(['posts.publish', 'admin']),
  );

  const canManageUsers = computed(() =>
    hasAnyPermission(['users.manage', 'admin']),
  );

  const canManageSettings = computed(() =>
    hasAnyPermission(['settings.write', 'admin']),
  );

  const canModerateComments = computed(() =>
    hasAnyPermission(['comments.moderate', 'admin']),
  );

  return {
    hasPermission,
    hasAnyPermission,
    requirePermission,
    canManagePosts,
    canPublishPosts,
    canManageUsers,
    canManageSettings,
    canModerateComments,
  };
};
