// apps/web/middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    // Store the intended destination
    const redirectPath = to.fullPath !== '/auth' ? to.fullPath : '/';

    // Redirect to login with return URL
    return navigateTo({
      path: '/auth',
      query: {
        redirect: redirectPath,
      },
    });
  }
});
