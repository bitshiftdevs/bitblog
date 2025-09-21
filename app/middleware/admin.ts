export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore();

  console.log('Auth middleware: ', auth.canAccessAdmin);
  if (!auth.canAccessAdmin) {
    // Show error toast
    const toast = useToast();
    toast.add({
      title: 'Access Denied',
      description: 'You do not have permission to access the admin area.',
      color: 'error',
      duration: 5000,
    });
    const redirectPath = to.fullPath !== '/auth/login' ? to.fullPath : '/';
    return navigateTo({
      path: '/auth/login',
      query: {
        redirect: redirectPath,
      },
    });
  }
});
