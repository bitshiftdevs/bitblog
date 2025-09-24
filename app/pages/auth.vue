<script setup lang="ts">
definePageMeta({
  slayout: false,
});

useSeoMeta({
  title: 'Sign In',
  description: 'Sign in to your account',
  robots: 'noindex, nofollow',
});

const route = useRoute();
const toast = useToast();

const isLoading = ref(false);

const handleOAuthLogin = (provider: 'github' | 'google') => {
  const redirectTo = (route.query.redirect as string) || '/';
  const loginUrl = `/api/auth/${provider}?redirect=${encodeURIComponent(redirectTo)}`;
  window.location.href = loginUrl;
  // auth.openInPopup(loginUrl);
};

// Check for OAuth error messages in URL
onMounted(() => {
  const error = route.query.error as string;
  if (error === 'oauth_error') {
    toast.add({
      title: 'OAuth Error',
      description: 'There was an error during the OAuth login process.',
      color: 'error',
    });
  } else if (error === 'oauth_failed') {
    toast.add({
      title: 'OAuth Failed',
      description: 'OAuth login failed. Please try again.',
      color: 'error',
    });
  }
});
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-primary">
          Continue With
        </h2>
      </div>

      <!-- Login Form -->
      <UCard class="p-6">
        <LogoSeparator />

        <div class="mt-6 grid grid-cols-2 gap-3">
          <UButton
            variant="outline"
            icon="i-simple-icons-github"
            class="justify-center"
            label="Github"
            @click="handleOAuthLogin('github')"
            :disabled="isLoading"
          />
          <UButton
            variant="outline"
            icon="i-simple-icons-google"
            class="justify-center"
            label="Google"
            @click="handleOAuthLogin('google')"
            :disabled="isLoading"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
