<script setup lang="ts">
import { UpdateProfileSchema } from '~~/shared/schemas';
import type { User } from '~~/shared/types';

definePageMeta({
  middleware: 'auth',
});

const auth = useAuth();
const toast = useToast();

const isEditing = ref(false);
const isLoading = ref(false);

// Form state
const form = ref({
  name: auth.user?.name || '',
  bio: auth.user?.bio || '',
  avatarUrl: auth.user?.avatarUrl || '',
});

// Profile data (non-blocking)
const { data: profile, refresh: refreshProfile, pending: profileLoading } = useLazyFetch<{
  success: boolean;
  data: User;
}>('/api/profile', {
  key: 'user-profile',
  default: () => ({ success: false, data: null as any }),
});

// Watch for profile data changes to update form
watch(
  () => profile.value?.data,
  (newProfile) => {
    if (newProfile) {
      form.value = {
        name: newProfile.name,
        bio: newProfile.bio || '',
        avatarUrl: newProfile.avatarUrl || '',
      };
    }
  },
  { immediate: true },
);

const bioCharCount = computed(() => form.value.bio.length);
const bioMaxLength = 500;

// Reset form when canceling edit
const resetForm = () => {
  if (profile.value?.data) {
    form.value = {
      name: profile.value.data.name,
      bio: profile.value.data.bio || '',
      avatarUrl: profile.value.data.avatarUrl || '',
    };
  }
  isEditing.value = false;
};

// Save profile changes
const saveProfile = async () => {
  try {
    // Validate form data
    const validatedData = UpdateProfileSchema.parse({
      name: form.value.name,
      bio: form.value.bio || undefined,
      avatarUrl: form.value.avatarUrl || undefined,
    });

    isLoading.value = true;

    const response = await $fetch<{ success: boolean; data: User }>('/api/profile', {
      method: 'PATCH',
      body: validatedData,
    });

    if (response.success) {
      await refreshProfile();
      await auth.refreshSession();
      isEditing.value = false;

      toast.add({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
        color: 'success',
      });
    }
  } catch (error: any) {
    console.error('Profile update error:', error);
    toast.add({
      title: 'Update failed',
      description: error.data?.message || 'Failed to update profile. Please try again.',
      color: 'error',
    });
  } finally {
    isLoading.value = false;
  }
};

// Format member since date
const memberSince = computed(() => {
  if (!profile.value?.data?.createdAt) return '';
  return new Date(profile.value.data.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
});
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account information and preferences
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="profileLoading" class="space-y-6">
        <USkeleton class="h-32 w-full rounded-lg" />
        <USkeleton class="h-20 w-full rounded-lg" />
        <USkeleton class="h-16 w-full rounded-lg" />
      </div>

      <!-- Profile content -->
      <div v-else-if="profile?.data" class="space-y-6">
        <!-- Profile Header Card -->
        <UCard>
          <div class="flex items-start justify-between">
            <div class="flex items-center space-x-4">
              <UAvatar
                :src="profile.data.avatarUrl"
                :alt="profile.data.name"
                size="xl"
                class="ring-2 ring-gray-200 dark:ring-gray-700"
              />
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ profile.data.name }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ profile.data.email }}
                </p>
                <p
                  v-if="memberSince"
                  class="text-xs text-gray-400 dark:text-gray-500 mt-1"
                >
                  Member since {{ memberSince }}
                </p>
              </div>
            </div>

            <!-- Edit button -->
            <UButton
              v-if="!isEditing"
              @click="isEditing = true"
              color="accent"
              variant="outline"
              icon="i-lucide-edit"
            >
              Edit Profile
            </UButton>
          </div>

          <!-- Bio -->
          <div v-if="profile.data.bio && !isEditing" class="mt-4">
            <p class="text-gray-700 dark:text-gray-300">
              {{ profile.data.bio }}
            </p>
          </div>
          <div v-else-if="!profile.data.bio && !isEditing" class="mt-4">
            <p class="text-gray-400 dark:text-gray-500 text-sm italic">
              No bio added yet
            </p>
          </div>
        </UCard>

        <!-- Edit Form -->
        <UCard v-if="isEditing">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Edit Profile
              </h3>
            </div>
          </template>

          <form @submit.prevent="saveProfile" class="space-y-6">
            <!-- Name -->
            <UFormField label="Name" required>
              <UInput
                v-model="form.name"
                placeholder="Your full name"
                :disabled="isLoading"
              />
            </UFormField>

            <!-- Bio -->
            <UFormField
              label="Bio"
              :description="`${bioCharCount}/${bioMaxLength} characters`"
            >
              <UTextarea
                v-model="form.bio"
                placeholder="Tell us about yourself..."
                :rows="4"
                :maxlength="bioMaxLength"
                :disabled="isLoading"
              />
            </UFormField>

            <!-- Avatar URL -->
            <UFormField
              label="Avatar URL"
              description="Link to your profile picture"
            >
              <UInput
                v-model="form.avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                :disabled="isLoading"
              />
            </UFormField>

            <!-- Avatar Preview -->
            <div v-if="form.avatarUrl" class="flex items-center space-x-3">
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Preview:</span
              >
              <UAvatar :src="form.avatarUrl" :alt="form.name" size="md" />
            </div>

            <!-- Form actions -->
            <div
              class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <UButton
                type="button"
                @click="resetForm"
                color="accent"
                variant="outline"
                :disabled="isLoading"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="isLoading"
                :disabled="isLoading || !form.name.trim()"
              >
                Save Changes
              </UButton>
            </div>
          </form>
        </UCard>

        <!-- Account Info -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Account Information
            </h3>
          </template>

          <div class="space-y-4">
            <div class="flex justify-between items-center py-2">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ profile.data.email }}
                </p>
              </div>
              <UBadge color="neutral" variant="outline"> OAuth Account </UBadge>
            </div>

            <div class="flex justify-between items-center py-2">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  Account Status
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ profile.data.isActive ? "Active" : "Inactive" }}
                </p>
              </div>
              <UBadge :color="profile.data.isActive ? 'success' : 'error'">
                {{ profile.data.isActive ? "Active" : "Inactive" }}
              </UBadge>
            </div>

            <div
              v-if="profile.data.isAdmin"
              class="flex justify-between items-center py-2"
            >
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  Admin Access
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  You have administrator privileges
                </p>
              </div>
              <UBadge color="info"> Admin </UBadge>
            </div>

            <div class="flex justify-between items-center py-2">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  Member Since
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ memberSince }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
