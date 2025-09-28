<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

defineEmits<{
  close: [];
}>();

const auth = useAuth();

// Stats for badges (would be fetched from API)
const postStats = ref({ draft: 0, scheduled: 0 });
const commentStats = ref({ pending: 0 });

// Fetch stats
const { data: statsData } = await useLazyFetch('/api/admin/stats');
if (statsData.value?.data) {
  postStats.value = statsData.value.data.posts || postStats.value;
  commentStats.value = statsData.value.data.comments || commentStats.value;
}

// Navigation menu items
const navigationItems = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Dashboard',
    icon: 'i-lucide-home',
    to: '/admin',
  },
  {
    label: 'Content',
    icon: 'i-lucide-folder',
    defaultOpen: true,
    children: [
      {
        label: 'Posts',
        icon: 'i-lucide-notebook-text',
        to: '/admin/posts',
        badge: postStats.value.draft > 0 ? postStats.value.draft.toString() : undefined,
      },
      {
        label: 'Categories',
        icon: 'i-lucide-folder',
        to: '/admin/categories',
      },
      {
        label: 'Tags',
        icon: 'i-lucide-tag',
        to: '/admin/tags',
      },
    ],
  },
  {
    label: 'Media Library',
    icon: 'i-lucide-image',
    to: '/admin/media',
  },
  {
    label: 'Engagement',
    icon: 'i-lucide-users',
    children: [
      {
        label: 'Comments',
        icon: 'i-lucide-message-circle-dashed',
        to: '/admin/comments',
        badge: commentStats.value.pending > 0 ? commentStats.value.pending.toString() : undefined,
      },
      {
        label: 'Newsletter',
        icon: 'i-lucide-mail-check',
        to: '/admin/newsletter',
      },
    ],
  },
  {
    label: 'Management',
    icon: 'i-lucide-settings',
    children: [
      {
        label: 'Users',
        icon: 'i-lucide-users',
        to: '/admin/users',
      },
      {
        label: 'Analytics',
        icon: 'i-lucide-bar-chart-3',
        to: '/admin/analytics',
      },
      {
        label: 'Reports',
        icon: 'i-lucide-file-chart-line',
        to: '/admin/reports',
      },
      {
        label: 'SEO Settings',
        icon: 'i-lucide-search',
        to: '/admin/settings/seo',
      },
    ],
  },
]);

// User menu items
const userMenuItems = computed(() => [
  [
    {
      label: 'View Site',
      icon: 'i-lucide-square-arrow-up-right',
      to: '/',
      target: '_blank',
    },
  ],
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/profile',
    },
  ],
  [
    {
      label: 'Sign Out',
      icon: 'i-lucide-log-out',
      click: async () => await auth.logout(),
    },
  ],
]);
</script>
<template>
  <UDashboardSidebar collapsible class="w-96">
    <!-- Logo -->
    <template #header>
      <NuxtLink to="/admin" class="flex items-center space-x-2">
        <UIcon name="i-lucide-settings" class="h-5 w-5 text-white" />
        <span class="text-white font-semibold">Admin Panel</span>
      </NuxtLink>

      <UButton
        variant="ghost"
        size="sm"
        icon="i-lucide-x"
        class="lg:hidden text-gray-400 hover:text-white"
        @click="$emit('close')"
      />
    </template>

    <!-- Navigation -->
    <UNavigationMenu
      :items="navigationItems"
      orientation="vertical"
      class="px-2 py-4"
    />

    <template #footer>
      <!-- User info -->
      <div class="flex items-center">
        <UAvatar :src="auth.user?.avatarUrl" :alt="auth.user?.name" size="sm" />
        <div class="ml-3 flex-1 min-w-0">
          <p class="text-sm font-medium text-white truncate">
            {{ auth.user?.name }}
          </p>
          <p class="text-xs text-gray-400 truncate">{{ auth.user?.email }}</p>
        </div>

        <UDropdownMenu
          :items="userMenuItems"
          :popper="{ placement: 'top-end' }"
        >
          <UButton
            variant="ghost"
            size="sm"
            icon="i-lucide-ellipsis-vertical"
            class="text-gray-400 hover:text-white"
          />
        </UDropdownMenu>
      </div>
    </template>
  </UDashboardSidebar>
</template>
