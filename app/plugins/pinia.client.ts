export default defineNuxtPlugin(() => {
  // Auto-initialize auth store on client side
  const authStore = useAuthStore();

  // Initialize auth state from localStorage
  authStore.initialize();
});
