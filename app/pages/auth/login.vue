<!-- apps/web/pages/auth/login.vue -->
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
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <UFormGroup label="Email address" required>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="Enter your email"
                required
                :disabled="isLoading"
                icon="i-heroicons-envelope"
              />
            </UFormGroup>
          </div>

          <div>
            <UFormGroup label="Password" required>
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Enter your password"
                required
                :disabled="isLoading"
                icon="i-heroicons-lock-closed"
              />
            </UFormGroup>
          </div>

          <div class="flex items-center justify-between">
            <UCheckbox
              v-model="form.rememberMe"
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
        </form>

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
              disabled
              class="justify-center"
            >
              GitHub
            </UButton>
            <UButton
              variant="outline"
              icon="i-simple-icons-google"
              disabled
              class="justify-center"
            >
              Google
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: false,
  middleware: ['guest'],
});

useSeoMeta({
  title: 'Sign In',
  description: 'Sign in to your account',
  robots: 'noindex, nofollow',
});

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const isLoading = ref(false);
const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
});

const handleLogin = async () => {
  isLoading.value = true;

  try {
    await authStore.login(form);

    toast.add({
      title: 'Welcome back!',
      description: 'You have been successfully signed in.',
      color: 'green',
    });

    // Redirect to intended page or dashboard
    const redirectTo = (route.query.redirect as string) || '/admin';
    await router.push(redirectTo);
  } catch (error: any) {
    toast.add({
      title: 'Sign in failed',
      description: error.data?.message || 'Invalid email or password.',
      color: 'red',
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
