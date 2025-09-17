<template>
  <header
    class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30"
  >
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <UButton
            variant="ghost"
            size="sm"
            icon="i-lucide-menu"
            class="lg:hidden mr-2"
            @click="toggleSidebar"
            aria-label="Toggle sidebar"
          />

          <!-- Page title -->
          <div v-if="pageTitle" class="hidden sm:block">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ pageTitle }}
            </h1>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-4">
          <!-- Quick actions -->
          <div class="hidden md:flex items-center space-x-2">
            <UButton
              to="/admin/posts/new"
              size="sm"
              icon="i-lucide-plus"
              label="New Post"
            />
          </div>

          <!-- Notifications -->
          <AdminNotifications />

          <!-- Quick search -->
          <AdminQuickSearch />

          <!-- Theme toggle -->
          <ThemeToggle />

          <!-- User menu -->
          <UDropdown
            :items="userMenuItems"
            :popper="{ placement: 'bottom-end' }"
          >
            <UButton variant="ghost" class="flex items-center space-x-2">
              <UAvatar :src="user?.avatarUrl" :alt="user?.name" size="sm" />
              <span class="hidden md:block text-sm font-medium">{{
                user?.name
              }}</span>
              <UIcon name="i-lucide-chevron-down" class="h-4 w-4" />
            </UButton>
          </UDropdown>
        </div>
      </div>
    </div>

    <!-- Secondary navigation (if any) -->
    <div
      v-if="$slots.nav"
      class="border-t border-gray-200 dark:border-gray-700"
    >
      <div class="px-4 sm:px-6 lg:px-8">
        <slot name="nav" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const route = useRoute();

// Get page title from route meta or generate from path
const pageTitle = computed(() => {
  if (route.meta.title) return route.meta.title;

  const segments = route.path.split('/').filter(Boolean);
  if (segments.length >= 2) {
    const section = segments[1];
    return section.charAt(0).toUpperCase() + section.slice(1);
  }

  return 'Dashboard';
});

// Sidebar toggle (injected from layout)
const toggleSidebar = inject('toggleSidebar', () => {});

// User menu items
const userMenuItems = computed(() => [
  [
    {
      label: user.value?.name || 'User',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: 'View Site',
      icon: 'i-lucide-square-arrow-up-right',
      to: '/',
      target: '_blank',
    },
    {
      label: 'Profile Settings',
      icon: 'i-lucide-user',
      to: '/admin/profile',
    },
  ],
  [
    {
      label: 'Help & Support',
      icon: 'i-lucide-badge-question-mark',
      to: '/admin/help',
    },
    {
      label: 'Keyboard Shortcuts',
      icon: 'i-lucide-terminal',
      click: () => {
        // Show keyboard shortcuts modal
      },
    },
  ],
  [
    {
      label: 'Sign Out',
      icon: 'i-lucide-log-out',
      click: async () => {
        await authStore.logout();
        await navigateTo('/auth/login');
      },
    },
  ],
]);
</script>
