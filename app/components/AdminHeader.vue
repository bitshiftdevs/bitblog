<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const auth = useAuth();

// Sidebar toggle (injected from layout)
const toggleSidebar = inject('toggleSidebar', () => {});

// User menu items
const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: auth.user?.name || 'User',
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
      to: '/profile',
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
      onSelect: () => {
        // Show keyboard shortcuts modal
      },
    },
  ],
  [
    {
      label: 'Sign Out',
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        await auth.logout();
        await navigateTo('/auth');
      },
    },
  ],
]);
</script>
<template>
  <UHeader>
    <template #title>
      <NuxtImg src="/favicon.ico" class="h-6 w-auto" format="webp" />
    </template>
    <temmplate #leading>
      <UDashboardSidebarCollapse />
    </temmplate>

    <template #right>
      <UDashboardNavbar title="Admin Dashboard">
        <template #right>
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

                <AdminNotifications />
                <AdminQuickSearch />
                <UColorModeSwitch />
                <UDropdownMenu
                  :items="userMenuItems"
                  :popper="{ placement: 'bottom-end' }"
                >
                  <UButton variant="ghost" class="flex items-center space-x-2">
                    <UAvatar
                      :src="auth.user?.avatarUrl"
                      :alt="auth.user?.name"
                      size="sm"
                    />
                    <span class="hidden md:block text-sm font-medium">{{
                      auth.user?.name
                    }}</span>
                    <UIcon name="i-lucide-chevron-down" class="h-4 w-4" />
                  </UButton>
                </UDropdownMenu>
              </div>
            </div>
          </div>
        </template>
      </UDashboardNavbar>
    </template>
  </UHeader>
</template>
