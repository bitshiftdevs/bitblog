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
    icon: 'i-lucide-layout-dashboard',
    to: '/admin',
  },
  {
    label: 'Content',
    icon: 'i-lucide-folder-open',
    defaultOpen: true,
    children: [
      {
        label: 'Posts',
        icon: 'i-lucide-file-text',
        to: '/admin/posts',
        badge: postStats.value.draft > 0 ? postStats.value.draft.toString() : undefined,
      },
      {
        label: 'Categories',
        icon: 'i-lucide-grid',
        to: '/admin/categories',
      },
      {
        label: 'Tags',
        icon: 'i-lucide-tags',
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
        icon: 'i-lucide-message-square',
        to: '/admin/comments',
        badge: commentStats.value.pending > 0 ? commentStats.value.pending.toString() : undefined,
      },
      {
        label: 'Newsletter',
        icon: 'i-lucide-mail',
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
        icon: 'i-lucide-users-2',
        to: '/admin/users',
      },
      {
        label: 'Analytics',
        icon: 'i-lucide-bar-chart-3',
        to: '/admin/analytics',
      },
      {
        label: 'Reports',
        icon: 'i-lucide-flag',
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
      icon: 'i-lucide-external-link',
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
  <UDashboardSidebar collapsible class="w-72 border-r border-default/20 bg-muted/5 shadow-lg backdrop-blur-xl">
    <!-- Logo -->
    <template #header>
      <NuxtLink to="/admin" class="flex items-center space-x-3 p-2 group">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
          <UIcon name="i-lucide-command" class="h-6 w-6 text-primary" />
        </div>
        <span class="text-xl font-bold text-highlighted tracking-tight">Admin Panel</span>
      </NuxtLink>

      <UButton
        variant="ghost"
        size="sm"
        icon="i-lucide-x"
        class="lg:hidden text-muted hover:text-highlighted"
        @click="$emit('close')"
      />
    </template>

    <!-- Navigation -->
    <UNavigationMenu
      :items="navigationItems"
      orientation="vertical"
      class="px-4 py-6"
      :ui="{ wrapper: 'space-y-2', item: 'rounded-xl hover:bg-muted/10 transition-colors font-medium', active: 'bg-primary/10 text-primary' }"
    />
  </UDashboardSidebar>
</template>
