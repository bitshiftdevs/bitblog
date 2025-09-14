// apps/web/middleware/admin.ts
export default defineNuxtRouteMiddleware((to, from) => {
	const { $authStore } = useNuxtApp();

	// Check if user has admin permissions
	if (!$authStore.canAccessAdmin) {
		// Show error toast
		const toast = useToast();
		toast.add({
			title: 'Access Denied',
			description: 'You do not have permission to access the admin area.',
			color: 'red',
			timeout: 5000,
		});

		// Redirect to home page
		return navigateTo('/');
	}
});
