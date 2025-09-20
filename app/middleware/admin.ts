export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuth();

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

    // Redirect to home page
    return navigateTo('/');
  }
});
