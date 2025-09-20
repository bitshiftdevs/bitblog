// apps/web/middleware/guest.ts
export default defineNuxtRouteMiddleware((to, from) => {
  console.log('Guest middleware');
  if (process.client) {
    const token = localStorage.getItem('auth.token');

    if (token) {
      return navigateTo('/admin');
    }
  }
});
