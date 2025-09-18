<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Or
          <NuxtLink
            to="/auth/login"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
          >
            sign in to your existing account
          </NuxtLink>
        </p>
      </div>

      <!-- Registration Form -->
      <UCard class="p-6">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <UFormField label="Full name" required>
              <UInput
                v-model="form.name"
                placeholder="Enter your full name"
                required
                :disabled="isLoading"
                icon="i-lucide-user"
              />
            </UFormField>
          </div>

          <div>
            <UFormField label="Email address" required>
              <UInput
                v-model="form.email"
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
                v-model="form.password"
                type="password"
                placeholder="Create a password"
                required
                :disabled="isLoading"
                icon="i-lucide-lock-keyhole"
              />
            </UFormField>
          </div>

          <div>
            <UFormField label="Confirm password" required>
              <UInput
                v-model="form.confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                :disabled="isLoading"
                icon="i-lucide-lock-keyhole"
              />
            </UFormField>
          </div>

          <div>
            <UCheckbox
              v-model="form.acceptTerms"
              required
              :disabled="isLoading"
            >
              <template #label>
                <span class="text-sm">
                  I accept the
                  <NuxtLink
                    to="/terms"
                    class="text-primary-600 hover:text-primary-500"
                  >
                    Terms of Service
                  </NuxtLink>
                  and
                  <NuxtLink
                    to="/privacy"
                    class="text-primary-600 hover:text-primary-500"
                  >
                    Privacy Policy
                  </NuxtLink>
                </span>
              </template>
            </UCheckbox>
          </div>

          <UButton
            type="submit"
            :loading="isLoading"
            :disabled="!isFormValid"
            block
            size="lg"
          >
            Create account
          </UButton>
        </form>
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
  title: 'Create Account',
  description: 'Create a new account',
  robots: 'noindex, nofollow',
});

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const isLoading = ref(false);
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
});

const isFormValid = computed(() => {
  return (
    form.name.length >= 2 &&
    form.email.includes('@') &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword &&
    form.acceptTerms
  );
});

const handleRegister = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    toast.add({
      title: 'Account created!',
      description: 'Welcome! Your account has been created successfully.',
      color: 'green',
    });

    // Redirect to dashboard
    await router.push('/admin');
  } catch (error: any) {
    toast.add({
      title: 'Registration failed',
      description:
        error.data?.message || 'Failed to create account. Please try again.',
      color: 'red',
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
