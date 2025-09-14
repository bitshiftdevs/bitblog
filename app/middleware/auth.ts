// apps/web/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
	const { $authStore } = useNuxtApp();

	// Check if user is authenticated
	if (!$authStore.isAuthenticated) {
		// Store the intended destination
		const redirectPath = to.fullPath !== '/auth/login' ? to.fullPath : '/';

		// Redirect to login with return URL
		return navigateTo({
			path: '/auth/login',
			query: {
				redirect: redirectPath,
			},
		});
	}
});
