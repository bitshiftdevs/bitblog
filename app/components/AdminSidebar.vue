<script setup lang="ts">
defineEmits<{
  close: [];
}>();

const auth = useAuth();

// Permission checks

// Stats for badges (would be fetched from API)
const postStats = ref({ draft: 0, scheduled: 0 });
const commentStats = ref({ pending: 0 });

// Fetch stats
const { data: statsData } = await useFetch('/api/admin/stats');
if (statsData.value?.data) {
  postStats.value = statsData.value.data.posts || postStats.value;
  commentStats.value = statsData.value.data.comments || commentStats.value;
}

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
      to: '/admin/profile',
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
  <UDashboardSidebar collapsible resizable>
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
    <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      <!-- Dashboard -->
      <SidebarItem
        to="/admin"
        icon="i-lucide-home"
        label="Dashboard"
        :exact="true"
      />

      <!-- Content Management -->
      <SidebarSection title="Content">
        <SidebarItem
          to="/admin/posts"
          icon="i-lucide-notebook-text"
          label="Posts"
          :badge="postStats.draft > 0 ? postStats.draft : undefined"
        />

        <SidebarItem
          to="/admin/categories"
          icon="i-lucide-folder"
          label="Categories"
        />

        <SidebarItem to="/admin/tags" icon="i-lucide-tag" label="Tags" />
      </SidebarSection>

      <!-- Media -->
      <SidebarSection title="Media">
        <SidebarItem
          to="/admin/media"
          icon="i-lucide-image"
          label="Media Library"
        />
      </SidebarSection>

      <!-- Engagement -->
      <SidebarSection title="Engagement">
        <SidebarItem
          to="/admin/comments"
          icon="i-lucide-message-circle-dashed"
          label="Comments"
          :badge="commentStats.pending > 0 ? commentStats.pending : undefined"
        />

        <SidebarItem
          to="/admin/newsletter"
          icon="i-lucide-mail-check"
          label="Newsletter"
        />
      </SidebarSection>

      <!-- Users (Admin only) -->
      <SidebarSection title="Users">
        <SidebarItem
          to="/admin/users"
          icon="i-lucide-users"
          label="All Users"
        />
      </SidebarSection>

      <!-- Analytics -->
      <SidebarSection title="Analytics">
        <SidebarItem
          to="/admin/analytics"
          icon="i-lucide-bar-chart-3"
          label="Analytics"
        />

        <SidebarItem
          to="/admin/reports"
          icon="i-lucide-file-chart-line"
          label="Reports"
        />
      </SidebarSection>

      <!-- Settings (Admin only) -->
      <SidebarSection title="Settings">
        <SidebarItem
          to="/admin/settings/seo"
          icon="i-lucide-search"
          label="SEO Settings"
        />
      </SidebarSection>

      <!-- System -->
      <SidebarSection title="System">
        <SidebarItem
          to="/admin/backups"
          icon="i-lucide-archive"
          label="Backups"
        />
      </SidebarSection>
    </nav>

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
