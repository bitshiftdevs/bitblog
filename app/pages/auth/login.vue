<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { LoginSchema, type LoginType } from '~~/shared/schemas';

definePageMeta({
  layout: false,
});

useSeoMeta({
  title: 'Sign In',
  description: 'Sign in to your account',
  robots: 'noindex, nofollow',
});

const auth = useAuth();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const isLoading = ref(false);

const state = reactive({
  email: '',
  password: '',
  rememberMe: false,
});

const redirectTo = (route.query.redirect as string) || '/';
const handleLogin = async (event: FormSubmitEvent<LoginType>) => {
  isLoading.value = true;

  try {
    await auth.login(event.data);

    toast.add({
      title: 'Welcome back!',
      description: 'You have been successfully signed in.',
      color: 'success',
    });

    // Redirect to intended page or dashboard
    await router.replace(redirectTo);
  } catch (error: any) {
    toast.add({
      title: 'Sign in failed',
      description: error.data?.message || 'Invalid email or password.',
      color: 'error',
    });
  } finally {
    isLoading.value = false;
  }
};

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
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Or
          <NuxtLink
            to="/auth/register"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            create a new account
          </NuxtLink>
        </p>
      </div>

      <!-- Login Form -->
      <UCard class="p-6">
        <UForm
          :schema="LoginSchema"
          :state
          @submit.prevent="handleLogin"
          class="space-y-6"
        >
          <div>
            <UFormField label="Email address" required>
              <UInput
                v-model="state.email"
                type="email"
                placeholder="Enter your email"
                required
                :disabled="isLoading"
                icon="i-lucide-mail"
              />
            </UFormField>
          </div>

          <div>
            <UFormField label="Password" required>
              <UInput
                v-model="state.password"
                type="password"
                placeholder="Enter your password"
                required
                :disabled="isLoading"
                icon="i-lucide-lock-keyhole"
              />
            </UFormField>
          </div>

          <div class="flex items-center justify-between">
            <UCheckbox
              v-model="state.rememberMe"
              label="Remember me"
              :disabled="isLoading"
            />

            <NuxtLink
              to="/auth/forgot-password"
              class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Forgot your password?
            </NuxtLink>
          </div>

          <UButton type="submit" :loading="isLoading" block size="lg">
            Sign in
          </UButton>
        </UForm>

        <!-- Social Login (if implemented) -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div
                class="w-full border-t border-gray-300 dark:border-gray-600"
              />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500"
                >Or continue with</span
              >
            </div>
          </div>

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
        </div>
      </UCard>
    </div>
  </div>
</template>
